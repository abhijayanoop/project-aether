import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/environment';
import logger from './config/logger';

const startServer = async () => {
  try {
    await connectDatabase();

    const PORT = parseInt(env.PORT, 10);

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.info(`Failed to start server`, error);
    process.exit(1);
  }
};

startServer();
