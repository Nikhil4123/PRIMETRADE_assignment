const { createClient } = require('redis');
const logger = require('../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const REDIS_ENABLED = String(process.env.REDIS_ENABLED || 'false').toLowerCase() === 'true';

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
  }
});

redisClient.on('error', (error) => {
  logger.error(`Redis error: ${error.message}`);
});

redisClient.on('ready', () => {
  logger.info('Redis client is ready');
});

const connectRedis = async () => {
  if (!REDIS_ENABLED) {
    logger.info('Redis disabled by configuration (REDIS_ENABLED=false)');
    return false;
  }

  if (redisClient.isOpen) {
    return true;
  }

  try {
    await redisClient.connect();
    logger.info(`Redis connected at ${REDIS_URL}`);
    return true;
  } catch (error) {
    logger.warn(`Redis connection skipped: ${error.message}`);
    return false;
  }
};

module.exports = {
  REDIS_ENABLED,
  redisClient,
  connectRedis
};