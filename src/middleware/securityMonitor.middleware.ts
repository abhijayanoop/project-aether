import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const securityMonitor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const suspiciousPatterns = [
    /(\.\.|\/\/|\\\\)/, // Path traversal
    /<script/i, // XSS
    /union.*select/i, // SQL injection
    /\$where/i, // NoSQL injection
  ];

  const checkData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkData)) {
      logger.warn('⚠️ Suspicious request detected', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        pattern: pattern.toString(),
      });
      break;
    }
  }

  next();
};
