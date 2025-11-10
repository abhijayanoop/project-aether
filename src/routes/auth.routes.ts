import { Router } from 'express';
import { validate } from '../middleware/validator.middleware';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from '../validators/auth.validator';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken
);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

export default router;
