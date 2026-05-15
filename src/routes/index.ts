import authRoutes from './auth.route';
import userRoutes from './user.route';
import merchantRoutes from './merchant.route';
import serviceRoutes from './service.route';
import orderRoutes from './order.route';
import paymentRoutes from './payment.route';
import reviewRoutes from './review.route';
import reportRoutes from './report.route';
import applicationRoutes from './application.route';
import uploadRoutes from './upload.route';
import { Router } from 'express';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/merchants', merchantRoutes);
router.use('/services', serviceRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/applications', applicationRoutes);
router.use('/upload', uploadRoutes);

export default router;
