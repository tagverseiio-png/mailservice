require('dotenv').config();
const { logger } = require('../../src/utils/logger');

// Middleware functions
const authenticateApiKey = (req) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return { valid: false, error: 'API key required' };
  }

  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
    return;
  }

  try {
    // Authenticate
    const authResult = authenticateApiKey(req);
    if (!authResult.valid) {
      logger.warn('Authentication failed', { error: authResult.error });
      res.status(401).json({
        success: false,
        message: authResult.error
      });
      return;
    }

    logger.info('Status check request');

    res.status(200).json({
      success: true,
      service: 'Email Service',
      status: 'operational',
      timestamp: new Date().toISOString(),
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true'
      }
    });

  } catch (error) {
    logger.error('Status check failed', { error: error.message });

    res.status(500).json({
      success: false,
      message: 'Service status check failed',
      error: error.message
    });
  }
};