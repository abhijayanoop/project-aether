import cors from 'cors';
import { env } from '../config/environment';

const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [];

export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400,
});
