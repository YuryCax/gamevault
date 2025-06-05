const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');
const GameSettings = require('../models/GameSettings');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const sns = new AWS.SNS();

const sendNotification = async (userId, message) => {
  try {
    const settings = await GameSettings.findOne({ gameType: 'poker' });
    if (!settings.features.notificationsEnabled) return;

    const params = {
      Message: message,
      TopicArn: process.env.SNS_TOPIC_ARN,
      MessageAttributes: {
        userId: { DataType: 'String', StringValue: userId },
      },
    };

    await sns.publish(params).promise();
    logger.info(`Notification sent to user ${userId}`);
  } catch (err) {
    logger.error(`Notification error: ${err.message}`);
  }
};

module.exports = { sendNotification };