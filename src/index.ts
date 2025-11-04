import { Router } from 'express';
import authRoutes from './routes/auth.routes';

const router = Router();

router.use('/auth', authRoutes);

router.use('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
