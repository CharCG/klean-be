"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAndSyncPayment = exports.handleWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const midtrans_config_1 = require("../config/midtrans.config");
const env_config_1 = require("../config/env.config");
const handleWebhook = async (payload) => {
    const { order_id, transaction_id, transaction_status, status_code, gross_amount, signature_key } = payload;
    const expectedSig = crypto_1.default
        .createHash('sha512')
        .update(`${order_id}${status_code}${gross_amount}${env_config_1.env.MIDTRANS_SERVER_KEY}`)
        .digest('hex');
    if (expectedSig !== signature_key) {
        throw new error_util_1.BadRequestError('Invalid signature');
    }
    const payment = await prisma_config_1.prisma.payment.findUnique({ where: { orderId: order_id } });
    if (!payment) {
        throw new error_util_1.BadRequestError('Payment record not found');
    }
    const statusMap = {
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
    await prisma_config_1.prisma.$transaction([
        prisma_config_1.prisma.payment.update({
            where: { orderId: order_id },
            data: {
                status: mapped.paymentStatus,
                transactionId: transaction_id,
                paidAt: mapped.paymentStatus === 'PAID' ? new Date() : null,
            },
        }),
        prisma_config_1.prisma.order.update({
            where: { id: order_id },
            data: { status: mapped.orderStatus },
        }),
    ]);
};
exports.handleWebhook = handleWebhook;
const verifyAndSyncPayment = async (orderId) => {
    const payment = await prisma_config_1.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) {
        throw new error_util_1.NotFoundError('Payment record not found');
    }
    if (payment.status !== 'PENDING') {
        return payment;
    }
    const statusResponse = await midtrans_config_1.snap.transaction.status(orderId);
    const transactionStatus = statusResponse.transaction_status;
    const transactionId = statusResponse.transaction_id;
    const statusMap = {
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
    const [updatedPayment] = await prisma_config_1.prisma.$transaction([
        prisma_config_1.prisma.payment.update({
            where: { orderId },
            data: {
                status: mapped.paymentStatus,
                transactionId,
                paidAt: mapped.paymentStatus === 'PAID' ? new Date() : null,
            },
        }),
        prisma_config_1.prisma.order.update({
            where: { id: orderId },
            data: { status: mapped.orderStatus },
        }),
    ]);
    return updatedPayment;
};
exports.verifyAndSyncPayment = verifyAndSyncPayment;
