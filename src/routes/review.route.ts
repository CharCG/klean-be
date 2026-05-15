import * as reviewController from '../controllers/review.controller';
import { Router } from 'express';
import { authMiddleware, adminGuard } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware, adminGuard);

router.get('/', reviewController.listAllReviews);
router.delete('/:id', reviewController.deleteReview);

export default router;
