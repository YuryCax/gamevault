const User = require('../models/User');
const sanitizeHtml = require('sanitize-html');
const { logger } = require('../utils/logger');

const updateProfile = async (req, res) => {
  const { username } = req.body;
  try {
    const cleanUsername = sanitizeHtml(username, {
      allowedTags: [],
      allowedAttributes: {},
    });
    if (!cleanUsername) return res.status(400).json({ message: req.t('invalid_username') });

    const user = await User.findById(req.user._id);
    user.username = cleanUsername;
    await user.save();
    res.status(200).json({ message: req.t('profile_updated') });
  } catch (err) {
    logger.error(`Profile update error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { updateProfile };