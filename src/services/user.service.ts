import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.config';
import { NotFoundError, UnauthorizedError } from '../utils/error.util';
import { ChangePasswordDto, UpdateProfileDto } from '../schemas/user.schema';

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
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
    throw new NotFoundError('User not found');
  }

  return user;
};

export const updateProfile = async (userId: string, dto: UpdateProfileDto) => {
  const user = await prisma.user.update({
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

export const changePassword = async (userId: string, dto: ChangePasswordDto) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Incorrect current password');
  }

  const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });
};
