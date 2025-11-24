import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

export const analyticsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  const originalSend = res.send;

  res.send = function (data: any) {
    const responseTime = Date.now() - startTime;

    // Track asynchronously (don't block response)
    analyticsService
      .trackApiRequest({
        userId: req.user?._id?.toString(),
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
      })
      .catch(() => {
        // Silent fail
      });

    return originalSend.call(this, data);
  };

  next();
};
