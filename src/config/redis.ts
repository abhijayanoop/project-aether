import Redis from 'ioredis';
import { env } from './environment';
import logger from './logger';

const redis = new Redis({
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  password: env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('❌ Redis connection error:', err);
});

redis.on('ready', () => {
  logger.info('Redis is ready');
});

export default redis;
