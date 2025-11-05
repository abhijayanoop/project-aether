import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ValidationError } from './error.middleware';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

export const uploadConfig = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new ValidationError('No file uploaded'));
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return next(
        new ValidationError(
          `Invalid file types. Allowed file types: ${allowedTypes.join(', ')}`
        )
      );
    }

    next();
  };
};

export const validateFileSize = (maxSizeMB: number) => {
    return (req: Request, res: Response, next: NextFunction){
        if(!req.file){
            return next(new ValidationError('No file uploaded'))
        }

        const maxSizeBytes = maxSizeMB * 1024 * 1024
        if(req.file.size > maxSizeBytes){
            return next(new ValidationError(`File size exceeds maximum size. Maximum size: ${maxSizeMB}MB`));
        }

        next()
    }
}
