const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { logger } = require('../utils/logger');

router.post(
  '/register',
  [
    body('username').notEmpty().trim(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('referralCode').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: req.t('invalid_data') });
    }
    const { username, email, password, referralCode } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: req.t('user_exists') });
      }
      let referredBy = null;
      if (referralCode) {
        referredBy = await User.findOne({ referralCode });
        if (!referredBy) {
          return res.status(400).json({ message: req.t('invalid_referral') });
        }
      }
      user = new User({ username, email, password, referredBy: referredBy ? referredBy._id : null });
      await user.save();
      const payload = { user: { id: user._id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      res.cookie('token', token, { httpOnly: true });
      res.status(201).json({ user: { id: user._id, username, email, role: user.role }, token });
    } catch (err) {
      logger.error(err.message);
      res.status(500).json({ message: req.t('register_error') });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: req.t('invalid_data') });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: req.t('invalid_credentials') });
      }
      const payload = { user: { id: user._id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      res.cookie('token', token, { httpOnly: true });
      res.json({ user: { id: user._id, username: user.username, email, role: user.role }, token });
    } catch (err) {
      logger.error(err.message);
      res.status(500).json({ message: req.t('login_error') });
    }
  }
);

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: req.t('server_error') });
  }
});

module.exports = router;