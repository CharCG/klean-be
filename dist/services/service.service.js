"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.listServices = void 0;
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const getMerchantOrThrow = async (userId) => {
    const merchant = await prisma_config_1.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) {
        throw new error_util_1.NotFoundError('Merchant not found');
    }
    return merchant;
};
const listServices = async (userId) => {
    const merchant = await getMerchantOrThrow(userId);
    return prisma_config_1.prisma.service.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'asc' },
    });
};
exports.listServices = listServices;
const createService = async (userId, dto) => {
    const merchant = await getMerchantOrThrow(userId);
    return prisma_config_1.prisma.service.create({
        data: { ...dto, merchantId: merchant.id },
    });
};
exports.createService = createService;
const updateService = async (userId, serviceId, dto) => {
    const merchant = await getMerchantOrThrow(userId);
    const service = await prisma_config_1.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
        throw new error_util_1.NotFoundError('Service not found');
    }
    if (service.merchantId !== merchant.id) {
        throw new error_util_1.ForbiddenError('Not your service');
    }
    return prisma_config_1.prisma.service.update({ where: { id: serviceId }, data: dto });
};
exports.updateService = updateService;
const deleteService = async (userId, serviceId) => {
    const merchant = await getMerchantOrThrow(userId);
    const service = await prisma_config_1.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
        throw new error_util_1.NotFoundError('Service not found');
    }
    if (service.merchantId !== merchant.id) {
        throw new error_util_1.ForbiddenError('Not your service');
    }
    await prisma_config_1.prisma.service.delete({ where: { id: serviceId } });
};
exports.deleteService = deleteService;
