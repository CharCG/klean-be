"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmOrderReceived = exports.updateOrderEta = exports.updateOrderStatus = exports.listMerchantOrders = exports.getOrderById = exports.listCustomerOrders = exports.createOrder = void 0;
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const midtrans_config_1 = require("../config/midtrans.config");
const STATUS_PROGRESSION = {
    PROCESSING: 'FINISHED',
};
const createOrder = async (userId, dto) => {
    const customer = await prisma_config_1.prisma.user.findUnique({ where: { id: userId } });
    if (!customer) {
        throw new error_util_1.NotFoundError('User not found');
    }
    const merchant = await prisma_config_1.prisma.merchant.findUnique({ where: { id: dto.merchantId } });
    if (!merchant) {
        throw new error_util_1.NotFoundError('Merchant not found');
    }
    const serviceIds = dto.items.map((i) => i.serviceId);
    const services = await prisma_config_1.prisma.service.findMany({
        where: { id: { in: serviceIds } },
    });
    if (services.length !== serviceIds.length) {
        throw new error_util_1.BadRequestError('One or more services not found');
    }
    const unavailable = services.filter((s) => !s.isAvailable || s.merchantId !== dto.merchantId);
    if (unavailable.length > 0) {
        throw new error_util_1.BadRequestError('One or more services are unavailable or do not belong to this merchant');
    }
    const serviceMap = new Map(services.map((s) => [s.id, s]));
    let total = dto.items.reduce((sum, item) => {
        const svc = serviceMap.get(item.serviceId);
        return sum + svc.price * item.quantity;
    }, 0);
    const deliveryFee = dto.fulfillment === 'DELIVERY' ? 15000 : 0;
    total += deliveryFee;
    const order = await prisma_config_1.prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                total,
                fulfillment: dto.fulfillment,
                notes: dto.notes,
                customerId: userId,
                merchantId: dto.merchantId,
                items: {
                    create: dto.items.map((item) => {
                        const svc = serviceMap.get(item.serviceId);
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
    const snapResult = await (0, midtrans_config_1.createSnapTransaction)({
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
                const svc = serviceMap.get(item.serviceId);
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
    });
    const updatedPayment = await prisma_config_1.prisma.payment.update({
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
exports.createOrder = createOrder;
const listCustomerOrders = async (userId) => {
    return prisma_config_1.prisma.order.findMany({
        where: { customerId: userId },
        include: {
            items: true,
            payment: { select: { status: true, snapToken: true, snapRedirectUrl: true } },
            merchant: { select: { name: true, logoUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};
exports.listCustomerOrders = listCustomerOrders;
const getOrderById = async (userId, orderId, role) => {
    const order = await prisma_config_1.prisma.order.findUnique({
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
        throw new error_util_1.NotFoundError('Order not found');
    }
    if (role === 'CUSTOMER' && order.customerId !== userId) {
        throw new error_util_1.ForbiddenError('Access denied');
    }
    if (role === 'MERCHANT') {
        const merchant = await prisma_config_1.prisma.merchant.findUnique({ where: { userId } });
        if (!merchant || order.merchantId !== merchant.id) {
            throw new error_util_1.ForbiddenError('Access denied');
        }
    }
    return order;
};
exports.getOrderById = getOrderById;
const listMerchantOrders = async (userId, status) => {
    const merchant = await prisma_config_1.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
        throw new error_util_1.NotFoundError('Merchant not found');
    }
    const where = { merchantId: merchant.id };
    if (status) {
        where.status = status;
    }
    return prisma_config_1.prisma.order.findMany({
        where,
        include: {
            items: true,
            customer: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};
exports.listMerchantOrders = listMerchantOrders;
const updateOrderStatus = async (userId, orderId, dto) => {
    const merchant = await prisma_config_1.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
        throw new error_util_1.NotFoundError('Merchant not found');
    }
    const order = await prisma_config_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new error_util_1.NotFoundError('Order not found');
    }
    if (order.merchantId !== merchant.id) {
        throw new error_util_1.ForbiddenError('Access denied');
    }
    const allowed = STATUS_PROGRESSION[order.status];
    if (!allowed || allowed !== dto.status) {
        throw new error_util_1.BadRequestError(`Cannot transition from ${order.status} to ${dto.status}`);
    }
    return prisma_config_1.prisma.order.update({
        where: { id: orderId },
        data: { status: dto.status },
    });
};
exports.updateOrderStatus = updateOrderStatus;
const updateOrderEta = async (userId, orderId, dto) => {
    const merchant = await prisma_config_1.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
        throw new error_util_1.NotFoundError('Merchant not found');
    }
    const order = await prisma_config_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new error_util_1.NotFoundError('Order not found');
    }
    if (order.merchantId !== merchant.id) {
        throw new error_util_1.ForbiddenError('Access denied');
    }
    return prisma_config_1.prisma.order.update({
        where: { id: orderId },
        data: { estimationTime: dto.estimationTime },
    });
};
exports.updateOrderEta = updateOrderEta;
const confirmOrderReceived = async (userId, orderId) => {
    const order = await prisma_config_1.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
        throw new error_util_1.NotFoundError('Order not found');
    }
    if (order.customerId !== userId) {
        throw new error_util_1.ForbiddenError('Access denied');
    }
    if (order.status !== 'FINISHED') {
        throw new error_util_1.BadRequestError('Order must be in FINISHED status before confirming receipt');
    }
    return prisma_config_1.prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
    });
};
exports.confirmOrderReceived = confirmOrderReceived;
