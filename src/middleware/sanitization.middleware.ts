import { Request, Response, NextFunction } from 'express';

/**
 * Comprehensive input sanitization middleware
 * Protects against NoSQL injection and XSS attacks
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, '') // XSS: Remove < and >
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        // Skip dangerous MongoDB operator keys
        if (key.startsWith('$') || key.includes('.')) {
          continue;
        }
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize body (easy - it's writable)
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query (tricky - need to redefine property)
  if (req.query && Object.keys(req.query).length > 0) {
    const sanitizedQuery: any = {};
    for (const key in req.query) {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitizedQuery[key] = sanitizeObject(req.query[key]);
      }
    }
    Object.defineProperty(req, 'query', {
      value: sanitizedQuery,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  // Sanitize params (tricky - need to redefine property)
  if (req.params && Object.keys(req.params).length > 0) {
    const sanitizedParams: any = {};
    for (const key in req.params) {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitizedParams[key] = sanitizeObject(req.params[key]);
      }
    }
    Object.defineProperty(req, 'params', {
      value: sanitizedParams,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  next();
};
