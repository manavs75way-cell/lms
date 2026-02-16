import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';
import { loginSchema, registerSchema, refreshTokenSchema } from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
