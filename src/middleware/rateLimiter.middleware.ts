import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis';

const createRedisStore = () => {
  return new RedisStore({
    // @ts-expect-error - Known compatibility issue
    sendCommand: (...args: string[]) => redis.call(...args),
  });
};

export const globalLimitier = rateLimit({
  store: createRedisStore(),
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 15 * 60 * 100,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login requests, please try again later',
});

export const aiLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'AI generation limit reached, try again later',
});

export const uploadLimiter = rateLimit({
  store: createRedisStore(),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Upload limit reached, try again later',
});
