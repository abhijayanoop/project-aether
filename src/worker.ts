import { connectDatabase } from './config/database';
import logger from './config/logger';
import './workers/contentQueue.worker';

connectDatabase();

logger.info('🔧 Worker process started');

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  process.exit(0);
});
