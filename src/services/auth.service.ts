import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.config';
import { ConflictError, UnauthorizedError } from '../utils/error.util';
import { LoginDto, RegisterDto } from '../schemas/auth.schema';
import { env } from '../config/env.config';

export const register = async (dto: RegisterDto) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: dto.email }, { phone: dto.phone }],
    },
  });

  if (existingUser) {
    throw new ConflictError('Email or phone number already in use');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = await prisma.user.create({
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

export const login = async (dto: LoginDto) => {
  const user = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(dto.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });

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
