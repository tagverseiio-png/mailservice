const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Default error response
  let error = {
    success: false,
    message: 'Internal Server Error'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.details = err.message;
    return res.status(400).json(error);
  }

  if (err.message === 'Failed to send email') {
    error.message = 'Email sending failed';
    return res.status(500).json(error);
  }

  if (err.name === 'UnauthorizedError') {
    error.message = 'Unauthorized access';
    return res.status(401).json(error);
  }

  // Generic server error
  res.status(500).json(error);
};

module.exports = { errorHandler };