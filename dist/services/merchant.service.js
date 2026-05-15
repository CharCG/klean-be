"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMerchantDashboard = exports.updateMerchantProfile = exports.getMerchantByUserId = exports.getMerchantById = exports.listMerchants = void 0;
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const listMerchants = async () => {
    const merchants = await prisma_config_1.prisma.merchant.findMany({
        select: {
            id: true,
            name: true,
            rating: true,
            address: true,
            openTime: true,
            closeTime: true,
            logoUrl: true,
            bannerUrl: true,
        },
        orderBy: { rating: 'desc' },
    });
    return { merchants };
};
exports.listMerchants = listMerchants;
const getMerchantById = async (merchantId) => {
    const merchant = await prisma_config_1.prisma.merchant.findUnique({
        where: { id: merchantId },
        select: {
            id: true,
            name: true,
            rating: true,
            address: true,
            openTime: true,
            closeTime: true,
            businessPhone: true,
            businessEmail: true,
            businessDescription: true,
            logoUrl: true,
            bannerUrl: true,
            services: {
                where: { isAvailable: true },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    unit: true,
                    description: true,
                    isAvailable: true,
                },
            },
        },
    });
    if (!merchant) {
        throw new error_util_1.NotFoundError('Merchant not found');
    }
    return merchant;
};
exports.getMerchantById = getMerchantById;
const getMerchantByUserId = async (userId) => {
    const merchant = await prisma_config_1.prisma.merchant.findUnique({
        where: { userId },
        select: {
            id: true,
            name: true,
            rating: true,
            address: true,
            openTime: true,
            closeTime: true,
            businessPhone: true,
            businessEmail: true,
            businessDescription: true,
            bankName: true,
            bankAccount: true,
            bankHolder: true,
            logoUrl: true,
            bannerUrl: true,
        },
    });
    if (!merchant) {
        throw new error_util_1.NotFoundError('Merchant profile not found');
    }
    return merchant;
};
exports.getMerchantByUserId = getMerchantByUserId;
const updateMerchantProfile = async (userId, dto) => {
    const merchant = await prisma_config_1.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
        throw new error_util_1.NotFoundError('Merchant not found');
    }
    return prisma_config_1.prisma.merchant.update({
        where: { userId },
        data: dto,
        select: {
            id: true,
            name: true,
            address: true,
            openTime: true,
            closeTime: true,
            businessPhone: true,
            businessDescription: true,
            logoUrl: true,
            bannerUrl: true,
        },
    });
};
exports.updateMerchantProfile = updateMerchantProfile;
const getMerchantDashboard = async (userId) => {
    const merchant = await prisma_config_1.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant)
        throw new error_util_1.NotFoundError('Merchant not found');
    const [revenueResult, completedCount, reviewStats, recentReviews] = await prisma_config_1.prisma.$transaction([
        prisma_config_1.prisma.order.aggregate({
            where: { merchantId: merchant.id, status: 'COMPLETED' },
            _sum: { total: true },
        }),
        prisma_config_1.prisma.order.count({
            where: { merchantId: merchant.id, status: 'COMPLETED' },
        }),
        prisma_config_1.prisma.review.aggregate({
            where: { merchantId: merchant.id },
            _avg: { rating: true },
            _count: { id: true },
        }),
        prisma_config_1.prisma.review.findMany({
            where: { merchantId: merchant.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { user: { select: { name: true } } },
        }),
    ]);
    return {
        totalRevenue: revenueResult._sum.total ?? 0,
        completedOrders: completedCount,
        averageRating: reviewStats._avg.rating ?? 0,
        totalReviews: reviewStats._count.id,
        recentReviews,
    };
};
exports.getMerchantDashboard = getMerchantDashboard;
