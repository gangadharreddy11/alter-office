const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');
const App = require('./App');

const ApiKey = sequelize.define('ApiKey', {
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
  key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  key_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_used_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  revoked_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'api_keys',
  indexes: [
    { fields: ['app_id'] },
    { fields: ['key_hash'] },
    { fields: ['is_active'] }
  ]
});

// Method to generate API key
ApiKey.generateKey = function() {
  return 'ak_' + crypto.randomBytes(32).toString('hex');
};

// Method to hash API key
ApiKey.hashKey = function(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
};

// Define relationships
ApiKey.belongsTo(App, { foreignKey: 'app_id', as: 'app' });
App.hasMany(ApiKey, { foreignKey: 'app_id', as: 'apiKeys' });

module.exports = ApiKey;
