"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.listAllReviews = exports.createReview = void 0;
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const createReview = async (userId, orderId, dto) => {
    const order = await prisma_config_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { review: true },
    });
    if (!order) {
        throw new error_util_1.NotFoundError('Order not found');
    }
    if (order.customerId !== userId) {
        throw new error_util_1.ForbiddenError('Access denied');
    }
    if (order.status !== 'COMPLETED') {
        throw new error_util_1.BadRequestError('Order is not completed yet');
    }
    if (order.review) {
        throw new error_util_1.BadRequestError('Review already submitted for this order');
    }
    const review = await prisma_config_1.prisma.$transaction(async (tx) => {
        const newReview = await tx.review.create({
            data: {
                rating: dto.rating,
                comment: dto.comment,
                orderId,
                merchantId: order.merchantId,
                userId,
            },
        });
        const agg = await tx.review.aggregate({
            where: { merchantId: order.merchantId },
            _avg: { rating: true },
        });
        await tx.merchant.update({
            where: { id: order.merchantId },
            data: { rating: agg._avg.rating ?? 0 },
        });
        return newReview;
    });
    return review;
};
exports.createReview = createReview;
const listAllReviews = async () => {
    return prisma_config_1.prisma.review.findMany({
        include: {
            user: { select: { name: true } },
            merchant: { select: { name: true } },
            order: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};
exports.listAllReviews = listAllReviews;
const deleteReview = async (reviewId) => {
    const review = await prisma_config_1.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review)
        throw new error_util_1.NotFoundError('Review not found');
    await prisma_config_1.prisma.$transaction(async (tx) => {
        await tx.review.delete({ where: { id: reviewId } });
        const agg = await tx.review.aggregate({
            where: { merchantId: review.merchantId },
            _avg: { rating: true },
        });
        await tx.merchant.update({
            where: { id: review.merchantId },
            data: { rating: agg._avg.rating ?? 0 },
        });
    });
};
exports.deleteReview = deleteReview;
