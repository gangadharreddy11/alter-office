const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const App = require('./App');

const AnalyticsEvent = sequelize.define('AnalyticsEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  app_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: App,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referrer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  device: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'analytics_events',
  indexes: [
    { fields: ['app_id'] },
    { fields: ['event'] },
    { fields: ['timestamp'] },
    { fields: ['user_id'] },
    { fields: ['device'] },
    { fields: ['app_id', 'event'] },
    { fields: ['app_id', 'timestamp'] },
    { fields: ['app_id', 'event', 'timestamp'] }
  ]
});

// Define relationships
AnalyticsEvent.belongsTo(App, { foreignKey: 'app_id', as: 'app' });
App.hasMany(AnalyticsEvent, { foreignKey: 'app_id', as: 'events' });

module.exports = AnalyticsEvent;
