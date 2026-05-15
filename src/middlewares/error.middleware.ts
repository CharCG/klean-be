import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { ZodError } from 'zod';
import { AppResponse } from '../utils/response.util';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    AppResponse.error(err.statusCode, err.message, undefined, undefined, err.stack).send(res);
    return;
  }

  if (err instanceof ZodError) {
    AppResponse.error(422, 'Validation Error', undefined, err.issues, err.stack).send(res);
    return;
  }

  AppResponse.error(500, 'Internal Server Error', undefined, undefined, err.stack).send(res);
};
