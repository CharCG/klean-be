import * as serviceService from '../services/service.service';
import { Request, Response, NextFunction } from 'express';
import { AppResponse } from '../utils/response.util';

export const listServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await serviceService.listServices(req.user!.id);
    AppResponse.success(200, 'Services retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await serviceService.createService(req.user!.id, req.body);
    AppResponse.success(201, 'Service created successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await serviceService.updateService(req.user!.id, req.params.id as string, req.body);
    AppResponse.success(200, 'Service updated successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await serviceService.deleteService(req.user!.id, req.params.id as string);
    AppResponse.success(200, 'Service deleted successfully').send(res);
  } catch (err) {
    next(err);
  }
};
