const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const App = sequelize.define('App', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'apps',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['is_active'] }
  ]
});

// Define relationships
App.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(App, { foreignKey: 'user_id', as: 'apps' });

module.exports = App;
