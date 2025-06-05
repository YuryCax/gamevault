const Redis = require('redis');
const { logger } = require('../utils/logger');

const sentinelClient = Redis.createClient({
  sentinels: [
    { host: process.env.REDIS_SENTINEL_HOST_1, port: process.env.REDIS_SENTINEL_PORT_1 },
    { host: process.env.REDIS_SENTINEL_HOST_2, port: process.env.REDIS_SENTINEL_PORT_2 },
  ],
  name: 'master',
});

sentinelClient.on('error', (err) => {
  logger.error(`Redis Sentinel error: ${err.message}`);
});

const connectRedis = async () => {
  try {
    await sentinelClient.connect();
    logger.info('Connected to Redis via Sentinel');
  } catch (err) {
    logger.error(`Redis connection error: ${err.message}`);
  }
};

module.exports = { connectRedis, sentinelClient };