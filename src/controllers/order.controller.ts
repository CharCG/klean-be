import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { AppResponse } from '../utils/response.util';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.createOrder(req.user!.id, req.body);
    AppResponse.success(201, 'Order created successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const listCustomerOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.listCustomerOrders(req.user!.id);
    AppResponse.success(200, 'Orders retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const listMerchantOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.listMerchantOrders(req.user!.id, req.query.status as string);
    AppResponse.success(200, 'Orders retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.getOrderById(req.user!.id, req.params.id as string, req.user!.role);
    AppResponse.success(200, 'Order retrieved successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.updateOrderStatus(req.user!.id, req.params.id as string, req.body);
    AppResponse.success(200, 'Order status updated successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const updateOrderEta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.updateOrderEta(req.user!.id, req.params.id as string, req.body);
    AppResponse.success(200, 'Order eta updated successfully', data).send(res);
  } catch (err) {
    next(err);
  }
};

export const confirmOrderReceived = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await orderService.confirmOrderReceived(req.user!.id, req.params.id as string);
    AppResponse.success(200, 'Order marked as completed', data).send(res);
  } catch (err) {
    next(err);
  }
};

