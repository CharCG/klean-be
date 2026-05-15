import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/error.util';
import { env } from '../config/env.config';

export interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const customerGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'CUSTOMER' && req.user?.role !== 'MERCHANT' && req.user?.role !== 'ADMIN') {
    throw new UnauthorizedError('Access denied');
  }
  next();
};

export const merchantGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'MERCHANT' && req.user?.role !== 'ADMIN') {
    throw new UnauthorizedError('Access denied');
  }
  next();
};

export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    throw new UnauthorizedError('Access denied');
  }
  next();
};
