import * as userService from '../services/user.service';
import { Request, Response, NextFunction } from 'express';
import { AppResponse } from '../utils/response.util';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getProfile(req.user!.id);
    AppResponse.success(200, 'User profile retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.updateProfile(req.user!.id, req.body);
    AppResponse.success(200, 'User profile updated successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.changePassword(req.user!.id, req.body);
    AppResponse.success(200, 'User password changed successfully').send(res);
  } catch (err) {
    next(err);
  }
};
