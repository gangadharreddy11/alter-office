const { App, ApiKey } = require('../models');
const crypto = require('crypto');

class ApiKeyController {
  // Register a new app and generate API key
  static async register(req, res) {
    try {
      const { name, domain, description } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Create app
      const app = await App.create({
        user_id: userId,
        name,
        domain,
        description
      });

      // Generate API key
      const apiKeyValue = ApiKey.generateKey();
      const keyHash = ApiKey.hashKey(apiKeyValue);

      // Calculate expiry date
      const expiryDays = parseInt(process.env.API_KEY_EXPIRY_DAYS) || 365;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      // Create API key record
      const apiKey = await ApiKey.create({
        app_id: app.id,
        key: apiKeyValue.substring(0, 12) + '...', // Store prefix only
        key_hash: keyHash,
        expires_at: expiresAt
      });

      res.status(201).json({
        success: true,
        message: 'App registered successfully',
        data: {
          app: {
            id: app.id,
            name: app.name,
            domain: app.domain,
            description: app.description
          },
          apiKey: {
            key: apiKeyValue, // Return full key only once
            expiresAt: apiKey.expires_at
          }
        },
        warning: 'Please save this API key. You will not be able to see it again.'
      });
    } catch (error) {
      console.error('Register app error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register app',
        error: error.message
      });
    }
  }

  // Get API key info (without revealing the full key)
  static async getApiKey(req, res) {
    try {
      const { appId } = req.params;
      const userId = req.user.id;

      // Verify app ownership
      const app = await App.findOne({
        where: { id: appId, user_id: userId }
      });

      if (!app) {
        return res.status(404).json({
          success: false,
          message: 'App not found'
        });
      }

      // Get active API keys
      const apiKeys = await ApiKey.findAll({
        where: { app_id: appId },
        attributes: ['id', 'key', 'is_active', 'expires_at', 'last_used_at', 'created_at'],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          app: {
            id: app.id,
            name: app.name,
            domain: app.domain
          },
          apiKeys: apiKeys.map(key => ({
            id: key.id,
            keyPrefix: key.key,
            isActive: key.is_active,
            expiresAt: key.expires_at,
            lastUsedAt: key.last_used_at,
            createdAt: key.created_at
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve API key',
        error: error.message
      });
    }
  }

  // Get all apps for current user
  static async getApps(req, res) {
    try {
      const userId = req.user.id;

      const apps = await App.findAll({
        where: { user_id: userId },
        include: [{
          model: ApiKey,
          as: 'apiKeys',
          attributes: ['id', 'key', 'is_active', 'expires_at', 'last_used_at']
        }],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: apps
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve apps',
        error: error.message
      });
    }
  }

  // Revoke an API key
  static async revoke(req, res) {
    try {
      const { apiKeyId } = req.params;
      const userId = req.user.id;

      // Find API key and verify ownership
      const apiKey = await ApiKey.findOne({
        where: { id: apiKeyId },
        include: [{
          model: App,
          as: 'app',
          where: { user_id: userId }
        }]
      });

      if (!apiKey) {
        return res.status(404).json({
          success: false,
          message: 'API key not found'
        });
      }

      // Revoke the key
      await apiKey.update({
        is_active: false,
        revoked_at: new Date()
      });

      res.json({
        success: true,
        message: 'API key revoked successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to revoke API key',
        error: error.message
      });
    }
  }

  // Regenerate API key
  static async regenerate(req, res) {
    try {
      const { appId } = req.params;
      const userId = req.user.id;

      // Verify app ownership
      const app = await App.findOne({
        where: { id: appId, user_id: userId }
      });

      if (!app) {
        return res.status(404).json({
          success: false,
          message: 'App not found'
        });
      }

      // Revoke all existing keys
      await ApiKey.update(
        { is_active: false, revoked_at: new Date() },
        { where: { app_id: appId, is_active: true } }
      );

      // Generate new API key
      const apiKeyValue = ApiKey.generateKey();
      const keyHash = ApiKey.hashKey(apiKeyValue);

      const expiryDays = parseInt(process.env.API_KEY_EXPIRY_DAYS) || 365;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      const apiKey = await ApiKey.create({
        app_id: app.id,
        key: apiKeyValue.substring(0, 12) + '...',
        key_hash: keyHash,
        expires_at: expiresAt
      });

      res.json({
        success: true,
        message: 'API key regenerated successfully',
        data: {
          apiKey: {
            key: apiKeyValue,
            expiresAt: apiKey.expires_at
          }
        },
        warning: 'Please save this API key. You will not be able to see it again.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate API key',
        error: error.message
      });
    }
  }
}

module.exports = ApiKeyController;
