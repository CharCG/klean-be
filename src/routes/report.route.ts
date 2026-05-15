import * as reportController from '../controllers/report.controller';
import { Router } from 'express';

import { authMiddleware, adminGuard } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware, adminGuard);

router.get('/', reportController.listAllReports);
router.patch('/:id', reportController.resolveReport);

export default router;
