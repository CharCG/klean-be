import crypto from 'crypto';
import { prisma } from '../config/prisma.config';
import { BadRequestError, NotFoundError } from '../utils/error.util';
import { snap } from '../config/midtrans.config';
import { env } from '../config/env.config';

export const handleWebhook = async (payload: Record<string, string>) => {
  const { order_id, transaction_id, transaction_status, status_code, gross_amount, signature_key } = payload;

  const expectedSig = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${env.MIDTRANS_SERVER_KEY}`)
    .digest('hex');

  if (expectedSig !== signature_key) {
    throw new BadRequestError('Invalid signature');
  }

  const payment = await prisma.payment.findUnique({ where: { orderId: order_id } });

  if (!payment) {
    throw new BadRequestError('Payment record not found');
  }

  type PaymentStatusMap = {
    paymentStatus: 'PAID' | 'EXPIRED' | 'CANCELLED' | 'FAILED';
    orderStatus: 'PROCESSING' | 'FAILED';
  };

  const statusMap: Record<string, PaymentStatusMap> = {
    settlement: { paymentStatus: 'PAID', orderStatus: 'PROCESSING' },
    capture: { paymentStatus: 'PAID', orderStatus: 'PROCESSING' },
    expire: { paymentStatus: 'EXPIRED', orderStatus: 'FAILED' },
    cancel: { paymentStatus: 'CANCELLED', orderStatus: 'FAILED' },
    deny: { paymentStatus: 'CANCELLED', orderStatus: 'FAILED' },
    failure: { paymentStatus: 'FAILED', orderStatus: 'FAILED' },
  };

  const mapped = statusMap[transaction_status];

  if (!mapped) {
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId: order_id },
      data: {
        status: mapped.paymentStatus,
        transactionId: transaction_id,
        paidAt: mapped.paymentStatus === 'PAID' ? new Date() : null,
      },
    }),
    prisma.order.update({
      where: { id: order_id },
      data: { status: mapped.orderStatus },
    }),
  ]);
};

export const verifyAndSyncPayment = async (orderId: string) => {
  const payment = await prisma.payment.findUnique({ where: { orderId } });

  if (!payment) {
    throw new NotFoundError('Payment record not found');
  }

  if (payment.status !== 'PENDING') {
    return payment;
  }

  const statusResponse = await (snap as any).transaction.status(orderId) as Record<string, string>;
  const transactionStatus: string = statusResponse.transaction_status;
  const transactionId: string = statusResponse.transaction_id;

  type PaymentStatusMap = {
    paymentStatus: 'PAID' | 'EXPIRED' | 'CANCELLED' | 'FAILED';
    orderStatus: 'PROCESSING' | 'FAILED';
  };

  const statusMap: Record<string, PaymentStatusMap> = {
    settlement: { paymentStatus: 'PAID', orderStatus: 'PROCESSING' },
    capture: { paymentStatus: 'PAID', orderStatus: 'PROCESSING' },
    expire: { paymentStatus: 'EXPIRED', orderStatus: 'FAILED' },
    cancel: { paymentStatus: 'CANCELLED', orderStatus: 'FAILED' },
    deny: { paymentStatus: 'CANCELLED', orderStatus: 'FAILED' },
    failure: { paymentStatus: 'FAILED', orderStatus: 'FAILED' },
  };

  const mapped = statusMap[transactionStatus];

  if (!mapped) {
    return payment;
  }

  const [updatedPayment] = await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: {
        status: mapped.paymentStatus,
        transactionId,
        paidAt: mapped.paymentStatus === 'PAID' ? new Date() : null,
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: mapped.orderStatus },
    }),
  ]);

  return updatedPayment;
};
