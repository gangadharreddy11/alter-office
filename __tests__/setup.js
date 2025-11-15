require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_gwbxr8hFm7pe@ep-still-wave-ad295sc8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.REDIS_URL = 'redis://localhost:6379';

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock Redis if not available
jest.mock('../src/config/redis', () => ({
  connectRedis: jest.fn().mockResolvedValue(true),
  getRedisClient: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1)
  })
}));
