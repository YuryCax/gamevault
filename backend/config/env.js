require('dotenv').config();

module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  PORT: process.env.PORT,
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  TRONNING_API_KEY: process.env.TRONNING_API_KEY,
  WALLET_ADDRESS: process.env.WALLET_ADDRESS,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
};