"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const getProfile = async (userId) => {
    const user = await prisma_config_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            role: true,
            avatarUrl: true,
        },
    });
    if (!user) {
        throw new error_util_1.NotFoundError('User not found');
    }
    return user;
};
exports.getProfile = getProfile;
const updateProfile = async (userId, dto) => {
    const user = await prisma_config_1.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            avatarUrl: true,
        },
    });
    return user;
};
exports.updateProfile = updateProfile;
const changePassword = async (userId, dto) => {
    const user = await prisma_config_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new error_util_1.NotFoundError('User not found');
    }
    const isPasswordValid = await bcrypt_1.default.compare(dto.oldPassword, user.password);
    if (!isPasswordValid) {
        throw new error_util_1.UnauthorizedError('Incorrect current password');
    }
    const hashedNewPassword = await bcrypt_1.default.hash(dto.newPassword, 10);
    await prisma_config_1.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });
};
exports.changePassword = changePassword;
