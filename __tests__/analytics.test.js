const request = require('supertest');
const app = require('../src/server');
const { sequelize, User, App, ApiKey, AnalyticsEvent } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Analytics Endpoints', () => {
  let authToken;
  let apiKey;
  let appId;
  let userId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create test user
    const user = await User.create({
      google_id: 'test-google-id-2',
      email: 'analytics@test.com',
      name: 'Analytics User'
    });

    userId = user.id;
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create test app
    const testApp = await App.create({
      user_id: user.id,
      name: 'Analytics Test App',
      domain: 'https://analytics-test.com'
    });

    appId = testApp.id;

    // Create API key
    const apiKeyValue = ApiKey.generateKey();
    const keyHash = ApiKey.hashKey(apiKeyValue);

    await ApiKey.create({
      app_id: testApp.id,
      key: apiKeyValue.substring(0, 12) + '...',
      key_hash: keyHash,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    apiKey = apiKeyValue;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/analytics/collect', () => {
    it('should collect analytics event', async () => {
      const response = await request(app)
        .post('/api/analytics/collect')
        .set('x-api-key', apiKey)
        .send({
          event: 'page_view',
          url: 'https://test.com/page',
          referrer: 'https://google.com',
          device: 'desktop',
          userId: 'user123',
          metadata: {
            browser: 'Chrome',
            os: 'Windows'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('eventId');
    });

    it('should require API key', async () => {
      const response = await request(app)
        .post('/api/analytics/collect')
        .send({
          event: 'click'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate event data', async () => {
      const response = await request(app)
        .post('/api/analytics/collect')
        .set('x-api-key', apiKey)
        .send({
          // Missing required 'event' field
          url: 'https://test.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/analytics/event-summary', () => {
    beforeAll(async () => {
      // Create some test events
      await AnalyticsEvent.bulkCreate([
        {
          app_id: appId,
          event: 'button_click',
          device: 'mobile',
          user_id: 'user1',
          timestamp: new Date()
        },
        {
          app_id: appId,
          event: 'button_click',
          device: 'desktop',
          user_id: 'user2',
          timestamp: new Date()
        },
        {
          app_id: appId,
          event: 'button_click',
          device: 'mobile',
          user_id: 'user1',
          timestamp: new Date()
        }
      ]);
    });

    it('should get event summary', async () => {
      const response = await request(app)
        .get('/api/analytics/event-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          event: 'button_click'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.event).toBe('button_click');
      expect(response.body.data.count).toBe(3);
      expect(response.body.data.uniqueUsers).toBe(2);
      expect(response.body.data.deviceData).toHaveProperty('mobile');
      expect(response.body.data.deviceData).toHaveProperty('desktop');
    });

    it('should filter by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date();

      const response = await request(app)
        .get('/api/analytics/event-summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          event: 'button_click',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/analytics/user-stats', () => {
    it('should get user statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/user-stats')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          userId: 'user1'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('user1');
      expect(response.body.data).toHaveProperty('totalEvents');
      expect(response.body.data.totalEvents).toBeGreaterThan(0);
    });

    it('should require userId parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/user-stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });
});
