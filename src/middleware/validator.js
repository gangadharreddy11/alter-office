const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    next();
  };
};

// Validation schemas
const schemas = {
  createApp: Joi.object({
    name: Joi.string().required().min(3).max(255),
    domain: Joi.string().uri().optional(),
    description: Joi.string().max(1000).optional()
  }),

  collectEvent: Joi.object({
    event: Joi.string().required().min(1).max(255),
    url: Joi.string().uri().optional(),
    referrer: Joi.string().uri().optional(),
    device: Joi.string().valid('mobile', 'desktop', 'tablet').optional(),
    ipAddress: Joi.string().ip().optional(),
    userId: Joi.string().max(255).optional(),
    sessionId: Joi.string().max(255).optional(),
    timestamp: Joi.date().iso().optional(),
    metadata: Joi.object({
      browser: Joi.string().max(100).optional(),
      os: Joi.string().max(100).optional(),
      screenSize: Joi.string().max(50).optional()
    }).optional()
  }),

  eventSummaryQuery: Joi.object({
    event: Joi.string().required(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    app_id: Joi.string().uuid().optional()
  }),

  userStatsQuery: Joi.object({
    userId: Joi.string().required()
  })
};

module.exports = { validate, schemas };
