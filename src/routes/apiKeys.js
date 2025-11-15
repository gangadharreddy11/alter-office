const express = require('express');
const ApiKeyController = require('../controllers/apiKeyController');
const authenticateUser = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/api-keys/register:
 *   post:
 *     summary: Register a new app and generate API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: App name
 *               domain:
 *                 type: string
 *                 description: App domain/URL
 *               description:
 *                 type: string
 *                 description: App description
 *     responses:
 *       201:
 *         description: App registered successfully
 */
router.post(
  '/register',
  authenticateUser,
  apiLimiter,
  validate(schemas.createApp),
  ApiKeyController.register
);

/**
 * @swagger
 * /api/api-keys/apps:
 *   get:
 *     summary: Get all apps for current user
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Apps retrieved successfully
 */
router.get('/apps', authenticateUser, apiLimiter, ApiKeyController.getApps);

/**
 * @swagger
 * /api/api-keys/{appId}:
 *   get:
 *     summary: Get API key information for an app
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key information retrieved
 */
router.get('/:appId', authenticateUser, apiLimiter, ApiKeyController.getApiKey);

/**
 * @swagger
 * /api/api-keys/{apiKeyId}/revoke:
 *   post:
 *     summary: Revoke an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key revoked successfully
 */
router.post('/:apiKeyId/revoke', authenticateUser, apiLimiter, ApiKeyController.revoke);

/**
 * @swagger
 * /api/api-keys/{appId}/regenerate:
 *   post:
 *     summary: Regenerate API key for an app
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key regenerated successfully
 */
router.post('/:appId/regenerate', authenticateUser, apiLimiter, ApiKeyController.regenerate);

module.exports = router;
