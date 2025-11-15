const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use Neon PostgreSQL connection string
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_gwbxr8hFm7pe@ep-still-wave-ad295sc8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const isProduction = process.env.NODE_ENV === 'production';
const requireSSL = DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('amazonaws.com');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: requireSSL ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000
  } : {
    connectTimeout: 60000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 10000
  },
  retry: {
    max: 3
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = sequelize;
