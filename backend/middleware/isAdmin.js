const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.isAdmin = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещён' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Неверный токен' });
  }
};