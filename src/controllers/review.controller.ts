import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';
import { AppResponse } from '../utils/response.util';

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reviewService.createReview(req.user!.id, req.params.orderId as string, req.body);
    AppResponse.success(201, 'Review created successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const listAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reviewService.listAllReviews();
    AppResponse.success(200, 'Reviews retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await reviewService.deleteReview(req.params.id as string);
    AppResponse.success(200, 'Review deleted successfully').send(res);
  } catch (err) {
    next(err);
  }
};
