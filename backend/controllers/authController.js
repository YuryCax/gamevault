const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');

function sendToken(user, statusCode, res) {
  const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      balance: user.balance,
      xp: user.xp,
      role: user.role,
    },
  });
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: req.t('user_exists') });
    }
    const user = await User.create({ username, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ message: req.t('register_error') });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({ message: req.t('invalid_credentials') });
    }
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: req.t('login_error') });
  }
};