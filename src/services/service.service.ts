import { prisma } from '../config/prisma.config';
import { ForbiddenError, NotFoundError } from '../utils/error.util';
import { CreateServiceDto, UpdateServiceDto } from '../schemas/service.schema';

const getMerchantOrThrow = async (userId: string) => {
  const merchant = await prisma.merchant.findUnique({ where: { userId } });

  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  return merchant;
};

export const listServices = async (userId: string) => {
  const merchant = await getMerchantOrThrow(userId);

  return prisma.service.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: 'asc' },
  });
};

export const createService = async (userId: string, dto: CreateServiceDto) => {
  const merchant = await getMerchantOrThrow(userId);

  return prisma.service.create({
    data: { ...dto, merchantId: merchant.id },
  });
};

export const updateService = async (userId: string, serviceId: string, dto: UpdateServiceDto) => {
  const merchant = await getMerchantOrThrow(userId);
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  if (service.merchantId !== merchant.id) {
    throw new ForbiddenError('Not your service');
  }

  return prisma.service.update({ where: { id: serviceId }, data: dto });
};

export const deleteService = async (userId: string, serviceId: string) => {
  const merchant = await getMerchantOrThrow(userId);
  const service = await prisma.service.findUnique({ where: { id: serviceId } });

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  if (service.merchantId !== merchant.id) {
    throw new ForbiddenError('Not your service');
  }

  await prisma.service.delete({ where: { id: serviceId } });
};
