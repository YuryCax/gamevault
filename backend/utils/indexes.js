const mongoose = require('mongoose');
const GameHistory = require('../models/GameHistory');
const Transaction = require('../models/Transaction');
const { logger } = require('../utils/logger');

const setupIndexes = async () => {
  try {
    await GameHistory.collection.createIndex({ user: 1, gameType: 1, timestamp: -1 });
    await Transaction.collection.createIndex({ user: 1, type: 1, timestamp: -1 });
    logger.info('MongoDB indexes created');
  } catch (err) {
    logger.error(`Error creating indexes: ${err.message}`);
  }
};

module.exports = { setupIndexes };