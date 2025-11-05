import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/environment';
import morgan from 'morgan';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './index';
import {
  sanitizeInput,
  sanitizeMongoose,
} from './middleware/sanitization.middleware';

const app: Application = express();

app.use(helmet());

app.use(
  cors({ origin: env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

app.use(sanitizeInput);

app.use('/api', routes);

//error handlers
app.use(errorHandler);
app.use(notFoundHandler);

export default app;
