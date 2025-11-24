import { Analytics, IAnalytics } from '../models/Analytics.model';
import logger from '../config/logger';
import mongoose from 'mongoose';
import redis from '../config/redis';

export class AnalyticsService {
  async trackEvent(event: Partial<IAnalytics>) {
    try {
      await Analytics.create(event);

      // Update Redis counters
      const today = new Date().toISOString().split('T')[0];
      await Promise.all([
        redis.incr('analytics:total_events'),
        redis.hincrby('analytics:daily', today, 1),
      ]);
    } catch (error) {
      logger.error('Failed to track event', error);
    }
  }

  async trackApiRequest(data: {
    userId?: string;
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
  }) {
    await this.trackEvent({
      userId: data.userId
        ? new mongoose.Types.ObjectId(data.userId)
        : undefined,
      eventType: 'api_request',
      eventCategory: 'system',
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
    });
  }

  async getDailyActiveUsers(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Analytics.aggregate([
      {
        $match: {
          userId: { $exists: true },
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          users: { $addToSet: '$userId' },
        },
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          activeUsers: { $size: '$users' },
        },
      },
      { $sort: { date: 1 } },
    ]);
  }

  async getSystemHealth() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalRequests, errorCount, avgResponseTime] = await Promise.all([
      Analytics.countDocuments({
        eventType: 'api_request',
        timestamp: { $gte: last24Hours },
      }),
      Analytics.countDocuments({
        eventType: 'api_request',
        timestamp: { $gte: last24Hours },
        statusCode: { $gte: 400 },
      }),
      Analytics.aggregate([
        {
          $match: {
            eventType: 'api_request',
            timestamp: { $gte: last24Hours },
          },
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
          },
        },
      ]),
    ]);

    const errorRate =
      totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    return {
      totalRequests,
      errorCount,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: avgResponseTime[0]?.avgResponseTime
        ? Math.round(avgResponseTime[0].avgResponseTime)
        : 0,
      status:
        errorRate < 1 ? 'healthy' : errorRate < 5 ? 'warning' : 'critical',
    };
  }

  async getApiPerformance(days: number = 1) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Analytics.aggregate([
      {
        $match: {
          eventType: 'api_request',
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$endpoint',
          avgResponseTime: { $avg: '$responseTime' },
          totalRequests: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          endpoint: '$_id',
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          totalRequests: 1,
          errorRate: {
            $round: [
              { $multiply: [{ $divide: ['$errors', '$totalRequests'] }, 100] },
              2,
            ],
          },
        },
      },
      { $sort: { totalRequests: -1 } },
    ]);
  }
}

export const analyticsService = new AnalyticsService();
