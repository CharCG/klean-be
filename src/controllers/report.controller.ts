import * as reportService from '../services/report.service';
import { Request, Response, NextFunction } from 'express';
import { AppResponse } from '../utils/response.util';

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reportService.createReport(req.user!.id, req.params.orderId as string, req.body);
    AppResponse.success(201, 'Report created successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const listAllReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reportService.listAllReports();
    AppResponse.success(200, 'Reports retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const resolveReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reportService.resolveReport(req.params.id as string);
    AppResponse.success(200, 'Report resolved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};
