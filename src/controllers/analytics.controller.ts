import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.util';
import { ResponseUtil } from '../utils/response.util';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  getDailyActiveUsers = asyncHandler(async (req: Request, res: Response) => {
    const { days = '7' } = req.query;
    const data = await analyticsService.getDailyActiveUsers(
      parseInt(days as string)
    );
    ResponseUtil.success(res, { dailyActiveUsers: data });
  });

  getSystemHealth = asyncHandler(async (req: Request, res: Response) => {
    const health = await analyticsService.getSystemHealth();
    ResponseUtil.success(res, health);
  });

  getApiPerformance = asyncHandler(async (req: Request, res: Response) => {
    const { days = '1' } = req.query;
    const performance = await analyticsService.getApiPerformance(
      parseInt(days as string)
    );
    ResponseUtil.success(res, { performance });
  });
}

export const analyticsController = new AnalyticsController();
