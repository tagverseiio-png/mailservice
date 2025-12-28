const { logger } = require('../utils/logger');

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    logger.warn('API request without key', {
      ip: req.ip,
      url: req.url,
      userAgent: req.get('user-agent')
    });
    
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }

  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key used', {
      ip: req.ip,
      url: req.url,
      apiKey: apiKey.substring(0, 8) + '...',
      userAgent: req.get('user-agent')
    });
    
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  logger.info('Authenticated API request', {
    ip: req.ip,
    url: req.url,
    apiKey: apiKey.substring(0, 8) + '...'
  });

  next();
};

module.exports = { authenticateApiKey };