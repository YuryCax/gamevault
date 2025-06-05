const sanitizeHtml = require('sanitize-html');
const { logger } = require('../utils/logger');

const sendMessage = (io) => async (req, res) => {
  const { message } = req.body;
  try {
    const cleanMessage = sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {},
    });
    if (!cleanMessage) return res.status(400).json({ message: req.t('invalid_message') });

    io.emit('chatMessage', {
      username: req.user.username,
      message: cleanMessage,
      timestamp: new Date(),
    });
    res.status(200).json({ message: req.t('message_sent') });
  } catch (err) {
    logger.error(`Chat error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { sendMessage };