import { prisma } from '../config/prisma.config';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/error.util';
import { CreateReviewDto } from '../schemas/review.schema';

export const createReview = async (userId: string, orderId: string, dto: CreateReviewDto) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.customerId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  if (order.status !== 'COMPLETED') {
    throw new BadRequestError('Order is not completed yet');
  }

  if (order.review) {
    throw new BadRequestError('Review already submitted for this order');
  }

  const review = await prisma.$transaction(async (tx) => {
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

export const listAllReviews = async () => {
  return prisma.review.findMany({
    include: {
      user: { select: { name: true } },
      merchant: { select: { name: true } },
      order: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteReview = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');

  await prisma.$transaction(async (tx) => {
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
