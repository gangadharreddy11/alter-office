const redis = require('redis');
require('dotenv').config();

// Redis is optional - gracefully handle when not available
let redisClient = null;
let isRedisEnabled = false;

try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.log('Redis: Disabled after failed connection attempts');
          return false; // Stop trying
        }
        return Math.min(retries * 100, 3000);
      }
    }
  });

  redisClient.on('connect', () => {
    console.log('✓ Redis client connected');
    isRedisEnabled = true;
  });

  redisClient.on('error', (err) => {
    console.log('Redis not available, continuing without cache:', err.message);
    isRedisEnabled = false;
  });
} catch (error) {
  console.log('Redis initialization failed, continuing without cache');
  redisClient = null;
}

const connectRedis = async () => {
  if (!redisClient) {
    console.log('⚠ Redis disabled - running without cache');
    return;
  }
  
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      isRedisEnabled = true;
    }
  } catch (error) {
    console.log('⚠ Redis connection failed - continuing without cache:', error.message);
    isRedisEnabled = false;
  }
};

const getRedisClient = () => {
  return isRedisEnabled ? redisClient : null;
};

module.exports = { redisClient, connectRedis, getRedisClient, isRedisEnabled: () => isRedisEnabled };
