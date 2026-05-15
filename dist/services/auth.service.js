"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_config_1 = require("../config/prisma.config");
const error_util_1 = require("../utils/error.util");
const env_config_1 = require("../config/env.config");
const register = async (dto) => {
    const existingUser = await prisma_config_1.prisma.user.findFirst({
        where: {
            OR: [{ email: dto.email }, { phone: dto.phone }],
        },
    });
    if (existingUser) {
        throw new error_util_1.ConflictError('Email or phone number already in use');
    }
    const hashedPassword = await bcrypt_1.default.hash(dto.password, 10);
    const user = await prisma_config_1.prisma.user.create({
        data: {
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            phone: dto.phone,
            address: dto.address,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            role: true,
        },
    });
    return user;
};
exports.register = register;
const login = async (dto) => {
    const user = await prisma_config_1.prisma.user.findUnique({
        where: { email: dto.email },
    });
    if (!user) {
        throw new error_util_1.UnauthorizedError('Invalid email or password');
    }
    const isPasswordValid = await bcrypt_1.default.compare(dto.password, user.password);
    if (!isPasswordValid) {
        throw new error_util_1.UnauthorizedError('Invalid email or password');
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, env_config_1.env.JWT_SECRET, { expiresIn: '7d' });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
exports.login = login;
