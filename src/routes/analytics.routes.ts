import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Analytics endpoints
router.get('/daily-active-users', analyticsController.getDailyActiveUsers);
router.get('/system-health', analyticsController.getSystemHealth);
router.get('/api-performance', analyticsController.getApiPerformance);

export default router;
