const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');
const authenticateApiKey = require('../middleware/apiKeyAuth');
const authenticateUser = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');
const { apiLimiter, eventCollectionLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/analytics/collect:
 *   post:
 *     summary: Collect an analytics event
 *     tags: [Analytics]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *             properties:
 *               event:
 *                 type: string
 *                 example: "login_form_cta_click"
 *               url:
 *                 type: string
 *                 example: "https://example.com/page"
 *               referrer:
 *                 type: string
 *                 example: "https://google.com"
 *               device:
 *                 type: string
 *                 enum: [mobile, desktop, tablet]
 *               ipAddress:
 *                 type: string
 *               userId:
 *                 type: string
 *               sessionId:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               metadata:
 *                 type: object
 *                 properties:
 *                   browser:
 *                     type: string
 *                   os:
 *                     type: string
 *                   screenSize:
 *                     type: string
 *     responses:
 *       201:
 *         description: Event collected successfully
 */
router.post(
  '/collect',
  authenticateApiKey,
  eventCollectionLimiter,
  validate(schemas.collectEvent),
  AnalyticsController.collect
);

/**
 * @swagger
 * /api/analytics/event-summary:
 *   get:
 *     summary: Get event summary and analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     event:
 *                       type: string
 *                     count:
 *                       type: integer
 *                     uniqueUsers:
 *                       type: integer
 *                     deviceData:
 *                       type: object
 */
router.get('/event-summary', authenticateUser, apiLimiter, AnalyticsController.getEventSummary);

/**
 * @swagger
 * /api/analytics/user-stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 */
router.get('/user-stats', authenticateUser, apiLimiter, AnalyticsController.getUserStats);

module.exports = router;
