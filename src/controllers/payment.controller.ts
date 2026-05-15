import * as paymentService from '../services/payment.service';
import { Request, Response, NextFunction } from 'express';
import { AppResponse } from '../utils/response.util';

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await paymentService.handleWebhook(req.body);
    AppResponse.success(200, 'Webhook processed').send(res);
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await paymentService.verifyAndSyncPayment(req.params.orderId as string);
    AppResponse.success(200, 'Payment status synced', data).send(res);
  } catch (err) {
    next(err);
  }
};
