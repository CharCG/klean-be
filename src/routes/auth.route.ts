import * as authController from '../controllers/auth.controller';
import { Router } from 'express';
import { validateMiddleware } from '../middlewares/validate.middleware';
import { LoginSchema, RegisterSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validateMiddleware(RegisterSchema, 'body'), authController.register);
router.post('/login', validateMiddleware(LoginSchema, 'body'), authController.login);

export default router;
