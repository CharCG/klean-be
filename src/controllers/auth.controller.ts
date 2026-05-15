import * as authService from '../services/auth.service';
import { Request, Response, NextFunction } from 'express';
import { AppResponse } from '../utils/response.util';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    AppResponse.success(201, 'User registered successfully', result).send(res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    AppResponse.success(200, 'User logged in successfully', result).send(res);
  } catch (error) {
    next(error);
  }
};
