import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import contentRoutes from './routes/content.routes';

const router = Router();

router.use('/auth', authRoutes);

router.use('/content', contentRoutes);

router.use('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
