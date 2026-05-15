import * as applicationController from '../controllers/application.controller';
import { Router } from 'express';
import { authMiddleware, customerGuard, adminGuard } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createApplicationSchema, decideApplicationSchema } from '../schemas/application.schema';

const router = Router();

router.post(
  '/',
  authMiddleware,
  customerGuard,
  validateMiddleware(createApplicationSchema, 'body'),
  applicationController.submitApplication,
);
router.get('/', authMiddleware, adminGuard, applicationController.listApplications);
router.get('/:id', authMiddleware, adminGuard, applicationController.getApplicationById);
router.patch(
  '/:id',
  authMiddleware,
  adminGuard,
  validateMiddleware(decideApplicationSchema, 'body'),
  applicationController.decideApplication,
);

export default router;
