import { Response } from 'express';
import { ApiResponse } from '../types/common.types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ) {
    const response: ApiResponse<T> = { success: true, data, message };
    return res.status(statusCode).json(response);
  }

  static error<T>(
    res: Response,
    data?: T,
    statusCode: number = 500,
    message?: string
  ) {
    const response: ApiResponse<T> = { success: false, data, message };
    return res.status(statusCode).json(response);
  }
}
