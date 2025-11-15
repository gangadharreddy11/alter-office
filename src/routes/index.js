const express = require('express');
const authRoutes = require('./auth');
const apiKeyRoutes = require('./apiKeys');
const analyticsRoutes = require('./analytics');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
