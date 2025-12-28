require('dotenv').config();
const { sendEmail } = require('../../src/config/email.config');
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

const validateEmailRequest = (body) => {
  const { to, subject, html, text } = body;
  
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { valid: false, error: 'Valid email is required' };
  }
  
  if (!subject || subject.length === 0 || subject.length > 255) {
    return { valid: false, error: 'Subject is required and must be less than 255 characters' };
  }
  
  if (!html && !text) {
    return { valid: false, error: 'Either html or text content is required' };
  }
  
  return { valid: true };
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
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

    // Validate request
    const validationResult = validateEmailRequest(req.body);
    if (!validationResult.valid) {
      logger.warn('Validation failed', { error: validationResult.error });
      res.status(400).json({
        success: false,
        message: validationResult.error
      });
      return;
    }

    const { to, subject, html, text, attachments } = req.body;
    
    logger.info('Email send request', {
      to,
      subject,
      hasAttachments: attachments && attachments.length > 0
    });

    // Convert text to HTML if no HTML provided
    const emailHtml = html || (text ? `<p>${text.replace(/\n/g, '<br>')}</p>` : '');

    const result = await sendEmail(to, subject, emailHtml, attachments);
    
    logger.info('Email sent successfully', {
      messageId: result.messageId,
      to,
      subject
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    logger.error('Failed to send email', {
      error: error.message,
      to: req.body.to,
      subject: req.body.subject
    });

    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};