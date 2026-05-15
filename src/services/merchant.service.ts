import { prisma } from '../config/prisma.config';
import { NotFoundError } from '../utils/error.util';
import { UpdateMerchantProfileDto } from '../schemas/merchant.schema';

export const listMerchants = async () => {
  const merchants = await prisma.merchant.findMany({
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

export const getMerchantById = async (merchantId: string) => {
  const merchant = await prisma.merchant.findUnique({
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
    throw new NotFoundError('Merchant not found');
  }

  return merchant;
};

export const getMerchantByUserId = async (userId: string) => {
  const merchant = await prisma.merchant.findUnique({
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
    throw new NotFoundError('Merchant profile not found');
  }

  return merchant;
};

export const updateMerchantProfile = async (userId: string, dto: UpdateMerchantProfileDto) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });

  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  return prisma.merchant.update({
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

export const getMerchantDashboard = async (userId: string) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });
  if (!merchant) throw new NotFoundError('Merchant not found');

  const [revenueResult, completedCount, reviewStats, recentReviews] = await prisma.$transaction([
    prisma.order.aggregate({
      where: { merchantId: merchant.id, status: 'COMPLETED' },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { merchantId: merchant.id, status: 'COMPLETED' },
    }),
    prisma.review.aggregate({
      where: { merchantId: merchant.id },
      _avg: { rating: true },
      _count: { id: true },
    }),
    prisma.review.findMany({
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
