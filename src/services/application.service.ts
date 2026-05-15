import { prisma } from '../config/prisma.config';
import { BadRequestError, NotFoundError } from '../utils/error.util';
import { CreateApplicationDto, DecideApplicationDto } from '../schemas/application.schema';

export const submitApplication = async (userId: string, dto: CreateApplicationDto) => {
  const existing = await prisma.application.findFirst({
    where: { userId, status: 'PENDING' },
  });

  if (existing) {
    throw new BadRequestError('You already have a pending application');
  }

  return prisma.application.create({
    data: { ...dto, userId },
  });
};

export const listApplications = async () => {
  return prisma.application.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const getApplicationById = async (applicationId: string) => {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!app) {
    throw new NotFoundError('Application not found');
  }

  return app;
};

export const decideApplication = async (applicationId: string, dto: DecideApplicationDto) => {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { user: true },
  });

  if (!app) {
    throw new NotFoundError('Application not found');
  }

  if (app.status !== 'PENDING') {
    throw new BadRequestError('Application already processed');
  }

  if (dto.status === 'REJECTED') {
    return prisma.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });
  }

  if (!app.userId) {
    throw new BadRequestError('Application has no associated user');
  }

  await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: { status: 'ACCEPTED' },
    }),
    prisma.merchant.create({
      data: {
        userId: app.userId,
        name: app.businessName,
        address: app.businessAddress,
        openTime: app.openTime,
        closeTime: app.closeTime,
        businessPhone: app.businessPhone,
        businessEmail: app.businessEmail,
        businessDescription: app.businessDescription,
        bankName: app.bankType,
        bankAccount: app.bankAccount,
        bankHolder: app.bankHolder,
      },
    }),
    prisma.user.update({
      where: { id: app.userId },
      data: { role: 'MERCHANT' },
    }),
  ]);

  return prisma.application.findUnique({ where: { id: applicationId } });
};
