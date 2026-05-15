import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

type Target = 'body' | 'query' | 'params';

export const validateMiddleware =
  (schema: ZodObject<any>, target: Target) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      req[target] = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };
