const { body, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const validateEmailRequest = [
  body('to')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        // For bulk emails, validate each email in array
        return value.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      } else if (typeof value === 'string') {
        // For single email
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      return false;
    })
    .withMessage('Valid email(s) required'),
  
  body('recipients')
    .optional()
    .isArray()
    .withMessage('Recipients must be an array')
    .custom((recipients) => {
      return recipients.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    })
    .withMessage('All recipients must be valid emails'),
    
  body('subject')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Subject is required and must be less than 255 characters'),
    
  body('html')
    .optional()
    .isString()
    .withMessage('HTML content must be a string'),
    
  body('text')
    .optional()
    .isString()
    .withMessage('Text content must be a string'),
    
  // Require either html or text
  body().custom((body) => {
    if (!body.html && !body.text) {
      throw new Error('Either html or text content is required');
    }
    return true;
  }),
    
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', { errors: errors.array() });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('x-api-key') || req.query.apiKey;
  
  if (!apiKey) {
    logger.warn('API key is required');
    return res.status(401).json({
      success: false,
      message: 'API key is required',
    });
  }

  // In production, you would validate against a database or environment variable
  const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key');
    return res.status(403).json({
      success: false,
      message: 'Invalid API key',
    });
  }

  next();
};

module.exports = {
  validateEmailRequest,
  validate,
  apiKeyAuth,
};
