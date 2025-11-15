const request = require('supertest');
const app = require('../src/server');
const { sequelize, User, App, ApiKey } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('API Key Management', () => {
  let authToken;
  let userId;
  let appId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create a test user
    const user = await User.create({
      google_id: 'test-google-id',
      email: 'test@example.com',
      name: 'Test User'
    });

    userId = user.id;
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/api-keys/register', () => {
    it('should register a new app and generate API key', async () => {
      const response = await request(app)
        .post('/api/api-keys/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test App',
          domain: 'https://test.com',
          description: 'Test application'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.app).toHaveProperty('id');
      expect(response.body.data.app.name).toBe('Test App');
      expect(response.body.data.apiKey).toHaveProperty('key');
      expect(response.body.data.apiKey.key).toMatch(/^ak_/);

      appId = response.body.data.app.id;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/api-keys/register')
        .send({
          name: 'Test App 2'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/api-keys/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'AB' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/api-keys/apps', () => {
    it('should get all apps for user', async () => {
      const response = await request(app)
        .get('/api/api-keys/apps')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/api-keys/:appId', () => {
    it('should get API key info for an app', async () => {
      const response = await request(app)
        .get(`/api/api-keys/${appId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.app.id).toBe(appId);
      expect(Array.isArray(response.body.data.apiKeys)).toBe(true);
    });
  });

  describe('POST /api/api-keys/:appId/regenerate', () => {
    it('should regenerate API key', async () => {
      const response = await request(app)
        .post(`/api/api-keys/${appId}/regenerate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKey).toHaveProperty('key');
    });
  });
});
