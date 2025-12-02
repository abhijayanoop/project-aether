import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/analytics/daily-active-users:
 *   get:
 *     summary: Get daily active users
 *     description: Returns daily active users over a time period (e.g. last 7 or 30 days).
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Daily active users time series
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   activeUsers:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/daily-active-users', analyticsController.getDailyActiveUsers);

/**
 * @openapi
 * /api/analytics/system-health:
 *   get:
 *     summary: Get system health metrics
 *     description: Returns high-level metrics about system status and dependencies.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Overall system status (e.g. healthy, degraded)
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       responseTimeMs:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/system-health', analyticsController.getSystemHealth);

/**
 * @openapi
 * /api/analytics/api-performance:
 *   get:
 *     summary: Get API performance metrics
 *     description: Returns latency and error statistics for API endpoints.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: window
 *         schema:
 *           type: string
 *           example: "24h"
 *         required: false
 *         description: Time window for aggregation, e.g. 1h, 24h, 7d
 *     responses:
 *       200:
 *         description: API performance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       method:
 *                         type: string
 *                       avgLatencyMs:
 *                         type: number
 *                       p95LatencyMs:
 *                         type: number
 *                       errorRate:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/api-performance', analyticsController.getApiPerformance);

export default router;
