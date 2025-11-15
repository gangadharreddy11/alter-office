const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Website Analytics API',
      version: '1.0.0',
      description: 'A scalable backend API for collecting and analyzing website analytics data',
      contact: {
        name: 'API Support',
        email: 'support@analytics.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from Google OAuth login'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for event collection'
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Google OAuth authentication endpoints'
      },
      {
        name: 'API Keys',
        description: 'API key management endpoints'
      },
      {
        name: 'Analytics',
        description: 'Analytics data collection and reporting endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
