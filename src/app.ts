import express, { Application } from 'express';
import { env } from './config/environment';
import morgan from 'morgan';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './index';
import { sanitizeInput } from './middleware/sanitization.middleware';
import { securityHeaders } from './middleware/security.middleware';
import { corsConfig } from './middleware/cors.middleware';
import { globalLimitier } from './middleware/rateLimiter.middleware';
import { securityMonitor } from './middleware/securityMonitor.middleware';
import { analyticsMiddleware } from './middleware/analytics.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app: Application = express();

app.set('trust proxy', 1);

//1. security headers
app.use(securityHeaders);

// app.use(helmet());

// app.use(
//   cors({ origin: env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true })
// );

//2. cors
app.use(corsConfig);

//3. body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(analyticsMiddleware);

//4. logging
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

//5. rate limiting
app.use(globalLimitier);

//6. security monitoring
app.use(securityMonitor);

//7. input santization
app.use(sanitizeInput);

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

//Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

//error handlers
app.use(errorHandler);
app.use(notFoundHandler);

export default app;
