"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideApplication = exports.getApplicationById = exports.listApplications = exports.submitApplication = void 0;
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const submitApplication = async (userId, dto) => {
    const existing = await prisma_config_1.prisma.application.findFirst({
        where: { userId, status: 'PENDING' },
    });
    if (existing) {
        throw new error_util_1.BadRequestError('You already have a pending application');
    }
    return prisma_config_1.prisma.application.create({
        data: { ...dto, userId },
    });
};
exports.submitApplication = submitApplication;
const listApplications = async () => {
    return prisma_config_1.prisma.application.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
    });
};
exports.listApplications = listApplications;
const getApplicationById = async (applicationId) => {
    const app = await prisma_config_1.prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!app) {
        throw new error_util_1.NotFoundError('Application not found');
    }
    return app;
};
exports.getApplicationById = getApplicationById;
const decideApplication = async (applicationId, dto) => {
    const app = await prisma_config_1.prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true },
    });
    if (!app) {
        throw new error_util_1.NotFoundError('Application not found');
    }
    if (app.status !== 'PENDING') {
        throw new error_util_1.BadRequestError('Application already processed');
    }
    if (dto.status === 'REJECTED') {
        return prisma_config_1.prisma.application.update({
            where: { id: applicationId },
            data: { status: 'REJECTED' },
        });
    }
    if (!app.userId) {
        throw new error_util_1.BadRequestError('Application has no associated user');
    }
    await prisma_config_1.prisma.$transaction([
        prisma_config_1.prisma.application.update({
            where: { id: applicationId },
            data: { status: 'ACCEPTED' },
        }),
        prisma_config_1.prisma.merchant.create({
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
        prisma_config_1.prisma.user.update({
            where: { id: app.userId },
            data: { role: 'MERCHANT' },
        }),
    ]);
    return prisma_config_1.prisma.application.findUnique({ where: { id: applicationId } });
};
exports.decideApplication = decideApplication;
