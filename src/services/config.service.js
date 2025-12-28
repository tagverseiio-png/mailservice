const axios = require('axios');
const { logger } = require('../utils/logger');

class ConfigService {
  constructor() {
    this.cachedConfig = null;
    this.lastFetched = null;
    this.CACHE_TTL = parseInt(process.env.CONFIG_CACHE_TTL, 10) || 300000; // Use env var or default 5 minutes
  }

  async getConfig() {
    try {
      // Return cached config if it's still valid
      if (this.cachedConfig && (Date.now() - this.lastFetched) < this.CACHE_TTL) {
        return this.cachedConfig;
      }

      // Fetch from API
      const response = await axios.get(process.env.CONFIG_API_URL, {
        headers: {
          'Authorization': `Bearer ${process.env.CONFIG_API_KEY}`
        },
        timeout: 3000 // 3 seconds timeout
      });

      this.cachedConfig = response.data;
      this.lastFetched = Date.now();
      return this.cachedConfig;
    } catch (error) {
      logger.error('Failed to fetch config:', error);
      // Return default config if API call fails
      return {
        fromName: process.env.FROM_NAME || 'Default App Name'
      };
    }
  }

  async getFromName() {
    const config = await this.getConfig();
    return config.fromName;
  }
}

module.exports = new ConfigService();
