import * as merchantController from '../controllers/merchant.controller';
import { Router } from 'express';
import { authMiddleware, customerGuard, merchantGuard } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { updateMerchantProfileSchema } from '../schemas/merchant.schema';

const router = Router();

router.get('/', merchantController.listMerchants);
router.get('/me', authMiddleware, merchantGuard, merchantController.getMyMerchantProfile);
router.put(
  '/me',
  authMiddleware,
  merchantGuard,
  validateMiddleware(updateMerchantProfileSchema, 'body'),
  merchantController.updateMyMerchantProfile,
);
router.get('/me/dashboard', authMiddleware, merchantGuard, merchantController.getMyMerchantDashboard);
router.get('/:id', authMiddleware, customerGuard, merchantController.getMerchantById);

export default router;
