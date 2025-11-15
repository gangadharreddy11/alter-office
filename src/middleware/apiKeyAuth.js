const { ApiKey, App } = require('../models');

const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    // Hash the provided key
    const keyHash = ApiKey.hashKey(apiKey);

    // Find the API key
    const apiKeyRecord = await ApiKey.findOne({
      where: { key_hash: keyHash, is_active: true },
      include: [{
        model: App,
        as: 'app',
        where: { is_active: true }
      }]
    });

    if (!apiKeyRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive API key'
      });
    }

    // Check if key is expired
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'API key has expired'
      });
    }

    // Update last used timestamp
    await apiKeyRecord.update({ last_used_at: new Date() });

    // Attach app info to request
    req.app_id = apiKeyRecord.app_id;
    req.apiKey = apiKeyRecord;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'API key authentication error',
      error: error.message
    });
  }
};

module.exports = authenticateApiKey;
