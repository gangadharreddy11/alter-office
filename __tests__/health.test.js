const request = require('supertest');
const app = require('../src/server');

describe('Health Check', () => {
  it('should return API health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return 404 for unknown endpoints', async () => {
    const response = await request(app).get('/api/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
