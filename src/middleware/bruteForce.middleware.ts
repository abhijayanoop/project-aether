import { NextFunction, Request, Response } from 'express';
import redis from '../config/redis';
import { RateLimitError } from './error.middleware';

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60;

export const bruteForceProtection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;
  if (!email) return next();

  const key = `login_attempts:${email}`;

  try {
    const attempts = await redis.get(key);
    const attemptsCount = parseInt(attempts || '0');

    if (attemptsCount > MAX_ATTEMPTS) {
      const ttl = await redis.ttl(key);
      throw new RateLimitError(
        `Too many failed attempts. Try again in ${Math.ceil(ttl / 60)} minutes`
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const recordFailedAttempts = async (email: string) => {
  const key = `login_attempts:${email}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, LOCK_TIME);
  }
};

export const clearFailedAttempts = async (email: string) => {
  const key = `login_attempts:${email}`;
  await redis.del(key);
};
