import * as userController from '../controllers/user.controller';
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from '../schemas/user.schema';

const router = Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', validateMiddleware(updateProfileSchema, 'body'), userController.updateProfile);
router.patch('/profile/password', validateMiddleware(changePasswordSchema, 'body'), userController.changePassword);

export default router;
