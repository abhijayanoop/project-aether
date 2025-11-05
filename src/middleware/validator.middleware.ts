import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './error.middleware';

type ValidationType = 'body' | 'query' | 'params';

export const validate = (schema: ZodSchema, type: ValidationType = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data =
        type === 'body' ? req.body : type === 'query' ? req.query : req.params;

      const validated = await schema.parseAsync(data);

      if (type === 'body') req.body = validated;
      if (type === 'query') {
        Object.defineProperty(req, 'query', {
          value: validated,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (type === 'params') {
        Object.defineProperty(req, 'params', {
          value: validated,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // In Zod v4, it's 'issues' not 'errors'
        const errors = (error.issues || error.errors || []).map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new ValidationError('Validation failed', errors));
      }
      next(error);
    }
  };
};
