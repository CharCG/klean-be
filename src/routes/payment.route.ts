import * as paymentController from '../controllers/payment.controller';
import { Router } from 'express';
import { authMiddleware, customerGuard } from '../middlewares/auth.middleware';

const router = Router();

router.post('/notification', paymentController.handleWebhook);
router.post('/verify/:orderId', authMiddleware, customerGuard, paymentController.verifyPayment);

export default router;
