import * as orderController from '../controllers/order.controller';
import * as reviewController from '../controllers/review.controller';
import * as reportController from '../controllers/report.controller';
import { Router } from 'express';
import { authMiddleware, customerGuard, merchantGuard } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema, updateEtaSchema } from '../schemas/order.schema';
import { createReviewSchema } from '../schemas/review.schema';
import { createReportSchema } from '../schemas/report.schema';

const router = Router();

router.post(
  '/',
  authMiddleware,
  customerGuard,
  validateMiddleware(createOrderSchema, 'body'),
  orderController.createOrder,
);
router.get('/mine', authMiddleware, customerGuard, orderController.listCustomerOrders);
router.get('/merchant', authMiddleware, merchantGuard, orderController.listMerchantOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);

router.post(
  '/:orderId/reviews',
  authMiddleware,
  customerGuard,
  validateMiddleware(createReviewSchema, 'body'),
  reviewController.createReview,
);

router.post(
  '/:orderId/reports',
  authMiddleware,
  customerGuard,
  validateMiddleware(createReportSchema, 'body'),
  reportController.createReport,
);

router.patch(
  '/:id/status',
  authMiddleware,
  merchantGuard,
  validateMiddleware(updateOrderStatusSchema, 'body'),
  orderController.updateOrderStatus,
);
router.patch(
  '/:id/eta',
  authMiddleware,
  merchantGuard,
  validateMiddleware(updateEtaSchema, 'body'),
  orderController.updateOrderEta,
);

router.patch(
  '/:id/confirm',
  authMiddleware,
  customerGuard,
  orderController.confirmOrderReceived,
);

export default router;
