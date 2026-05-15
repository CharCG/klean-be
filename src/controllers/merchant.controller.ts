import * as merchantService from '../services/merchant.service';
import { Request, Response, NextFunction } from 'express';
import { AppResponse } from '../utils/response.util';

export const listMerchants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await merchantService.listMerchants();
    AppResponse.success(200, 'Merchants retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const getMerchantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await merchantService.getMerchantById(req.params.id as string);
    AppResponse.success(200, 'Merchant retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const getMyMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await merchantService.getMerchantByUserId(req.user!.id);
    AppResponse.success(200, 'Merchant profile retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const updateMyMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await merchantService.updateMerchantProfile(req.user!.id, req.body);
    AppResponse.success(200, 'Merchant profile updated successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const getMyMerchantDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await merchantService.getMerchantDashboard(req.user!.id);
    AppResponse.success(200, 'Merchant dashboard retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};
