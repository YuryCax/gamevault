const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { protect } = require('../middleware/auth');
const GameSettings = require('../models/GameSettings');
const Transaction = require('../models/Transaction');
const GameHistory = require('../models/GameHistory');

router.post('/play', protect, gameController.startGame);
router.get('/settings/:gameType', protect, async (req, res) => {
  try {
    const settings = await GameSettings.findOne({ gameType: req.params.gameType });
    if (!settings) {
      return res.status(404).json({ message: req.t('invalid_game_settings') });
    }
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});
router.get('/history/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});
router.get('/history/games', protect, async (req, res) => {
  try {
    const games = await GameHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

module.exports = router;