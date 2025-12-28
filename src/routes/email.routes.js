const express = require('express');
const { sendEmail } = require('../config/email.config');
const { authenticateApiKey } = require('../middleware/auth.middleware');
const { validateEmailRequest, validate } = require('../middleware/validation.middleware');
const { logger } = require('../utils/logger');

const router = express.Router();

// Apply authentication to all email routes
router.use(authenticateApiKey);

// Send email endpoint
router.post('/send', validateEmailRequest, validate, async (req, res) => {
  try {
    const { to, subject, html, text, attachments } = req.body;
    
    logger.info('Email send request', {
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      hasAttachments: attachments && attachments.length > 0,
      ip: req.ip
    });

    // Convert text to HTML if no HTML provided
    const emailHtml = html || (text ? `<p>${text.replace(/\n/g, '<br>')}</p>` : '');

    const result = await sendEmail(to, subject, emailHtml, attachments);
    
    logger.info('Email sent successfully', {
      messageId: result.messageId,
      to: Array.isArray(to) ? to.join(', ') : to,
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
      subject: req.body.subject,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

// Bulk email endpoint
router.post('/send-bulk', validateEmailRequest, validate, async (req, res) => {
  try {
    const { recipients, subject, html, text, attachments } = req.body;
    
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required for bulk email'
      });
    }

    logger.info('Bulk email send request', {
      recipientCount: recipients.length,
      subject,
      hasAttachments: attachments && attachments.length > 0,
      ip: req.ip
    });

    const emailHtml = html || (text ? `<p>${text.replace(/\n/g, '<br>')}</p>` : '');
    const results = [];
    const errors = [];

    // Send emails sequentially to avoid overwhelming SMTP server
    for (const recipient of recipients) {
      try {
        const result = await sendEmail(recipient, subject, emailHtml, attachments);
        results.push({
          to: recipient,
          success: true,
          messageId: result.messageId
        });
      } catch (error) {
        errors.push({
          to: recipient,
          success: false,
          error: error.message
        });
      }
    }

    logger.info('Bulk email completed', {
      total: recipients.length,
      successful: results.length,
      failed: errors.length,
      subject
    });

    res.status(200).json({
      success: true,
      message: `Bulk email completed: ${results.length} sent, ${errors.length} failed`,
      results: {
        successful: results,
        failed: errors
      }
    });

  } catch (error) {
    logger.error('Bulk email failed', {
      error: error.message,
      recipientCount: req.body.recipients?.length || 0,
      subject: req.body.subject,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Bulk email failed',
      error: error.message
    });
  }
});

// Email service status endpoint
router.get('/status', (req, res) => {
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
});

module.exports = router;