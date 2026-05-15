"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveReport = exports.listAllReports = exports.createReport = void 0;
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const createReport = async (userId, orderId, dto) => {
    const order = await prisma_config_1.prisma.order.findUnique({
        where: { id: orderId },
        include: { report: true },
    });
    if (!order) {
        throw new error_util_1.NotFoundError('Order not found');
    }
    if (order.customerId !== userId) {
        throw new error_util_1.ForbiddenError('Access denied');
    }
    if (order.status !== 'COMPLETED') {
        throw new error_util_1.BadRequestError('Can only report completed orders');
    }
    if (order.report) {
        throw new error_util_1.BadRequestError('Report already submitted for this order');
    }
    return prisma_config_1.prisma.report.create({
        data: {
            issue: dto.issue,
            orderId,
            userId,
        },
    });
};
exports.createReport = createReport;
const listAllReports = async () => {
    return prisma_config_1.prisma.report.findMany({
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
exports.listAllReports = listAllReports;
const resolveReport = async (reportId) => {
    const report = await prisma_config_1.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
        throw new error_util_1.NotFoundError('Report not found');
    }
    if (report.status === 'RESOLVED') {
        throw new error_util_1.BadRequestError('Report already resolved');
    }
    return prisma_config_1.prisma.report.update({
        where: { id: reportId },
        data: { status: 'RESOLVED' },
    });
};
exports.resolveReport = resolveReport;
