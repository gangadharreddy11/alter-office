const { AnalyticsEvent, App } = require('../models');
const { Op } = require('sequelize');
const { redisClient } = require('../config/redis');
const useragent = require('useragent');

class AnalyticsController {
  // Collect analytics event
  static async collect(req, res) {
    try {
      const {
        event,
        url,
        referrer,
        device,
        ipAddress,
        userId,
        sessionId,
        timestamp,
        metadata
      } = req.body;

      const appId = req.app_id;

      // Parse user agent if available
      let parsedMetadata = metadata || {};
      if (req.headers['user-agent']) {
        const agent = useragent.parse(req.headers['user-agent']);
        parsedMetadata = {
          ...parsedMetadata,
          browser: parsedMetadata.browser || agent.toAgent(),
          os: parsedMetadata.os || agent.os.toString(),
          device: parsedMetadata.device || agent.device.toString()
        };
      }

      // Determine device type if not provided
      let deviceType = device;
      if (!deviceType && req.headers['user-agent']) {
        const agent = useragent.parse(req.headers['user-agent']);
        if (agent.device.family === 'iPad' || agent.device.family === 'iPhone') {
          deviceType = 'mobile';
        } else if (agent.device.family.includes('Mobile')) {
          deviceType = 'mobile';
        } else {
          deviceType = 'desktop';
        }
      }

      // Create event
      const analyticsEvent = await AnalyticsEvent.create({
        app_id: appId,
        event,
        url,
        referrer,
        device: deviceType,
        ip_address: ipAddress || req.ip,
        user_id: userId,
        session_id: sessionId,
        timestamp: timestamp || new Date(),
        metadata: parsedMetadata
      });

      // Invalidate related cache
      const cacheKeys = [
        `event_summary:${appId}:${event}`,
        `event_summary:${appId}:${event}:*`,
        `user_stats:${userId}`
      ];

      for (const pattern of cacheKeys) {
        if (pattern.includes('*')) {
          // Delete pattern-based keys
          const keys = await redisClient.keys(pattern);
          if (keys.length > 0) {
            await redisClient.del(keys);
          }
        } else {
          await redisClient.del(pattern);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Event collected successfully',
        data: {
          eventId: analyticsEvent.id
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to collect event',
        error: error.message
      });
    }
  }

  // Get event summary
  static async getEventSummary(req, res) {
    try {
      const { event, startDate, endDate, app_id } = req.query;
      const userId = req.user.id;

      // Build cache key
      const cacheKey = `event_summary:${app_id || 'all'}:${event}:${startDate || 'all'}:${endDate || 'all'}`;

      // Check cache
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      // Build query conditions
      const whereConditions = { event };

      // If app_id is provided, use it; otherwise get all apps for user
      let appIds = [];
      if (app_id) {
        // Verify user owns this app
        const app = await App.findOne({
          where: { id: app_id, user_id: userId }
        });
        if (!app) {
          return res.status(404).json({
            success: false,
            message: 'App not found'
          });
        }
        appIds = [app_id];
      } else {
        // Get all apps for user
        const apps = await App.findAll({
          where: { user_id: userId },
          attributes: ['id']
        });
        appIds = apps.map(app => app.id);
      }

      if (appIds.length === 0) {
        return res.json({
          success: true,
          data: {
            event,
            count: 0,
            uniqueUsers: 0,
            deviceData: {}
          }
        });
      }

      whereConditions.app_id = { [Op.in]: appIds };

      // Date filtering
      if (startDate || endDate) {
        whereConditions.timestamp = {};
        if (startDate) {
          whereConditions.timestamp[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereConditions.timestamp[Op.lte] = new Date(endDate);
        }
      }

      // Get total count
      const count = await AnalyticsEvent.count({ where: whereConditions });

      // Get unique users
      const uniqueUsers = await AnalyticsEvent.count({
        where: whereConditions,
        distinct: true,
        col: 'user_id'
      });

      // Get device breakdown
      const deviceData = await AnalyticsEvent.findAll({
        where: whereConditions,
        attributes: [
          'device',
          [AnalyticsEvent.sequelize.fn('COUNT', AnalyticsEvent.sequelize.col('id')), 'count']
        ],
        group: ['device'],
        raw: true
      });

      const deviceStats = deviceData.reduce((acc, item) => {
        if (item.device) {
          acc[item.device] = parseInt(item.count);
        }
        return acc;
      }, {});

      const result = {
        event,
        count,
        uniqueUsers,
        deviceData: deviceStats
      };

      // Cache for 5 minutes
      await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

      res.json({
        success: true,
        data: result,
        cached: false
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve event summary',
        error: error.message
      });
    }
  }

  // Get user stats
  static async getUserStats(req, res) {
    try {
      const { userId } = req.query;
      const appUserId = req.user.id;

      // Build cache key
      const cacheKey = `user_stats:${userId}`;

      // Check cache
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true
        });
      }

      // Get all apps for current user
      const apps = await App.findAll({
        where: { user_id: appUserId },
        attributes: ['id']
      });

      const appIds = apps.map(app => app.id);

      if (appIds.length === 0) {
        return res.json({
          success: true,
          data: {
            userId,
            totalEvents: 0,
            deviceDetails: {},
            ipAddress: null
          }
        });
      }

      // Get total events for this user
      const totalEvents = await AnalyticsEvent.count({
        where: {
          user_id: userId,
          app_id: { [Op.in]: appIds }
        }
      });

      // Get latest event to extract device and IP info
      const latestEvent = await AnalyticsEvent.findOne({
        where: {
          user_id: userId,
          app_id: { [Op.in]: appIds }
        },
        order: [['timestamp', 'DESC']],
        attributes: ['metadata', 'ip_address']
      });

      const result = {
        userId,
        totalEvents,
        deviceDetails: latestEvent?.metadata || {},
        ipAddress: latestEvent?.ip_address || null
      };

      // Cache for 5 minutes
      await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

      res.json({
        success: true,
        data: result,
        cached: false
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user stats',
        error: error.message
      });
    }
  }
}

module.exports = AnalyticsController;
