const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      replicaSet: 'rs0',
    });
    logger.info('Connected to MongoDB Replica Set');
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
  }
};

module.exports = { connectMongoDB };