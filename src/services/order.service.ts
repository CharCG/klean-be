import { prisma } from '../config/prisma.config';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/error.util';
import { CreateOrderDto, UpdateEtaDto, UpdateOrderStatusDto } from '../schemas/order.schema';
import { OrderStatus } from '../generated/prisma/client';
import { createSnapTransaction } from '../config/midtrans.config';
import { env } from '../config/env.config';

const STATUS_PROGRESSION: Partial<Record<OrderStatus, OrderStatus>> = {
  PROCESSING: 'FINISHED',
};

export const createOrder = async (userId: string, dto: CreateOrderDto) => {
  const customer = await prisma.user.findUnique({ where: { id: userId } });

  if (!customer) {
    throw new NotFoundError('User not found');
  }

  const merchant = await prisma.merchant.findUnique({ where: { id: dto.merchantId } });

  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const serviceIds = dto.items.map((i) => i.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
  });

  if (services.length !== serviceIds.length) {
    throw new BadRequestError('One or more services not found');
  }

  const unavailable = services.filter((s) => !s.isAvailable || s.merchantId !== dto.merchantId);

  if (unavailable.length > 0) {
    throw new BadRequestError('One or more services are unavailable or do not belong to this merchant');
  }

  const serviceMap = new Map(services.map((s) => [s.id, s]));
  let total = dto.items.reduce((sum, item) => {
    const svc = serviceMap.get(item.serviceId)!;
    return sum + svc.price * item.quantity;
  }, 0);

  const deliveryFee = dto.fulfillment === 'DELIVERY' ? 15000 : 0;
  total += deliveryFee;

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        total,
        fulfillment: dto.fulfillment,
        notes: dto.notes,
        customerId: userId,
        merchantId: dto.merchantId,
        items: {
          create: dto.items.map((item) => {
            const svc = serviceMap.get(item.serviceId)!;
            return {
              serviceId: item.serviceId,
              name: svc.name,
              quantity: item.quantity,
              price: svc.price,
            };
          }),
        },
      },
      include: { items: true },
    });

    const payment = await tx.payment.create({
      data: {
        orderId: newOrder.id,
        amount: total,
        status: 'PENDING',
      },
    });

    return { order: newOrder, payment };
  });

  const finishUrl = `${env.FRONTEND_URL}/payment/finish?order_id=${order.order.id}`;

  const snapResult = await createSnapTransaction({
    transaction_details: {
      order_id: order.order.id,
      gross_amount: total,
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
      phone: customer.phone ?? '',
    },
    item_details: [
      ...dto.items.map((item) => {
        const svc = serviceMap.get(item.serviceId)!;
        return {
          id: svc.id,
          price: svc.price,
          quantity: item.quantity,
          name: svc.name.substring(0, 50),
        };
      }),
      ...(deliveryFee > 0
        ? [
          {
            id: 'DELIVERY_FEE',
            price: deliveryFee,
            quantity: 1,
            name: 'Delivery Fee',
          },
        ]
        : []),
    ],
    callbacks: {
      finish: finishUrl,
      unfinish: finishUrl,
      error: finishUrl,
    },
  });

  const updatedPayment = await prisma.payment.update({
    where: { orderId: order.order.id },
    data: {
      snapToken: snapResult.token,
      snapRedirectUrl: snapResult.redirect_url,
    },
  });

  return {
    order: order.order,
    payment: updatedPayment,
  };
};

export const listCustomerOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { customerId: userId },
    include: {
      items: true,
      payment: { select: { status: true, snapToken: true, snapRedirectUrl: true } },
      merchant: { select: { name: true, logoUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOrderById = async (userId: string, orderId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true,
      review: true,
      report: true,
      merchant: { select: { id: true, name: true, logoUrl: true } },
      customer: { select: { id: true, name: true, phone: true, address: true } },
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (role === 'CUSTOMER' && order.customerId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  if (role === 'MERCHANT') {
    const merchant = await prisma.merchant.findUnique({ where: { userId } });

    if (!merchant || order.merchantId !== merchant.id) {
      throw new ForbiddenError('Access denied');
    }
  }

  return order;
};

export const listMerchantOrders = async (userId: string, status?: string) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });

  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const where: { merchantId: string; status?: OrderStatus } = { merchantId: merchant.id };

  if (status) {
    where.status = status as OrderStatus;
  }

  return prisma.order.findMany({
    where,
    include: {
      items: true,
      customer: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateOrderStatus = async (userId: string, orderId: string, dto: UpdateOrderStatusDto) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });

  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.merchantId !== merchant.id) {
    throw new ForbiddenError('Access denied');
  }

  const allowed = STATUS_PROGRESSION[order.status];

  if (!allowed || allowed !== dto.status) {
    throw new BadRequestError(`Cannot transition from ${order.status} to ${dto.status}`);
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: dto.status },
  });
};

export const updateOrderEta = async (userId: string, orderId: string, dto: UpdateEtaDto) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });

  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.merchantId !== merchant.id) {
    throw new ForbiddenError('Access denied');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { estimationTime: dto.estimationTime },
  });
};

export const confirmOrderReceived = async (userId: string, orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.customerId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  if (order.status !== 'FINISHED') {
    throw new BadRequestError('Order must be in FINISHED status before confirming receipt');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED' },
  });
};