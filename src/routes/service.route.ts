import * as serviceController from '../controllers/service.controller';
import { Router } from 'express';
import { authMiddleware, merchantGuard } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { createServiceSchema, updateServiceSchema } from '../schemas/service.schema';

const router = Router();

router.use(authMiddleware, merchantGuard);

router.get('/', serviceController.listServices);
router.post('/', validateMiddleware(createServiceSchema, 'body'), serviceController.createService);
router.put('/:id', validateMiddleware(updateServiceSchema, 'body'), serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

export default router;
