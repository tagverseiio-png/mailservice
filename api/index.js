const { createServer } = require('http');
require('dotenv').config();
const app = require('../src/app');
const { logger } = require('../src/utils/logger');

// Create server instance
const server = createServer(app);

// Vercel serverless function handler
module.exports = async (req, res) => {
  logger.info(`Incoming ${req.method} ${req.url}`);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    res.statusCode = 204;
    return res.end();
  }

  // Handle the request with the Express app
  return app(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}
