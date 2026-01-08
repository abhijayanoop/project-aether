import Queue from 'bull';
import { env } from './environment';
import logger from './logger';

const contentQueue = new Queue('content-processing', {
  redis: {
    port: parseInt(env.REDIS_PORT || '6379'),
    host: env.REDIS_HOST || 'localhost',
    password: env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

contentQueue.on('completed', (job) => {
  logger.info(`✅ Job ${job.id} completed`);
});

contentQueue.on('failed', (job, err) => {
  logger.error(`❌ Job ${job?.id} failed:`, err.message);
});

export default contentQueue;
