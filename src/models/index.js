const sequelize = require('../config/database');
const User = require('./User');
const App = require('./App');
const ApiKey = require('./ApiKey');
const AnalyticsEvent = require('./AnalyticsEvent');

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  App,
  ApiKey,
  AnalyticsEvent
};
