import { Response } from 'express';
import { env } from '../config/env.config';

export class AppResponse<T = unknown> {
  readonly success: boolean;
  readonly statusCode: number;
  readonly message: string;
  readonly data?: T;
  readonly error?: any;
  readonly stack?: string;

  constructor(statusCode: number, message: string, data?: T, error?: any, stack?: string) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data) this.data = data;
    if (error) this.error = error;
    if (env.NODE_ENV === 'development' && stack) this.stack = stack;
  }

  send(res: Response): void {
    res.status(this.statusCode).json(this);
  }

  static success<T>(statusCode: number = 200, message: string, data?: T): AppResponse<T> {
    return new AppResponse<T>(statusCode, message, data);
  }

  static fail<T>(statusCode: number = 400, message: string, data?: T, error?: any): AppResponse<T> {
    return new AppResponse<T>(statusCode, message, data, error);
  }

  static error<T>(statusCode: number = 500, message: string, data?: T, error?: any, stack?: string): AppResponse<T> {
    return new AppResponse<T>(statusCode, message, data, error, stack);
  }
}
