import { prisma } from '../config/prisma.config';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/error.util';
import { CreateReportDto } from '../schemas/report.schema';

export const createReport = async (userId: string, orderId: string, dto: CreateReportDto) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { report: true },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.customerId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  if (order.status !== 'COMPLETED') {
    throw new BadRequestError('Can only report completed orders');
  }

  if (order.report) {
    throw new BadRequestError('Report already submitted for this order');
  }

  return prisma.report.create({
    data: {
      issue: dto.issue,
      orderId,
      userId,
    },
  });
};

export const listAllReports = async () => {
  return prisma.report.findMany({
    include: {
      user: { select: { name: true } },
      order: {
        select: {
          id: true,
          merchant: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const resolveReport = async (reportId: string) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });

  if (!report) {
    throw new NotFoundError('Report not found');
  }

  if (report.status === 'RESOLVED') {
    throw new BadRequestError('Report already resolved');
  }

  return prisma.report.update({
    where: { id: reportId },
    data: { status: 'RESOLVED' },
  });
};
