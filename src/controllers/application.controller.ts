import * as applicationService from '../services/application.service';
import { Request, Response, NextFunction } from 'express';
import { AppResponse } from '../utils/response.util';

export const submitApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await applicationService.submitApplication(req.user!.id, req.body);
    AppResponse.success(201, 'Application created successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const listApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await applicationService.listApplications();
    AppResponse.success(200, 'Applications retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await applicationService.getApplicationById(req.params.id as string);
    AppResponse.success(200, 'Application retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const decideApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await applicationService.decideApplication(req.params.id as string, req.body);
    AppResponse.success(200, 'Application decision saved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};
