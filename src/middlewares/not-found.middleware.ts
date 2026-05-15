import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/error.util';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  throw new NotFoundError();
};
