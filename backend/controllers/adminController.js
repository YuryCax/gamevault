const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Tournament = require('../models/Tournament');
const GameSettings = require('../models/GameSettings');

exports.createTournament = async (req, res) => {
  const { prizes } = req.body;
  if (prizes && prizes.reduce((sum, p) => sum + p, 0) !== 100) {
    return res.status(400).json({ message: req.t('invalid_prizes') });
  }
  try {
    const tournament = await Tournament.create(req.body);
    res.status(201).json(tournament);
  } catch (err) {
    res.status(500).json({ message: req.t('tournament_creation_error') });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: req.t('users_load_error') });
  }
};

exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.find({ type: 'withdrawal', status: 'pending' }).populate('userId', 'username email balance');
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: req.t('withdrawals_load_error') });
  }
};

exports.approveWithdrawal = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findById(id).populate('userId', 'balance');
    if (transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
      return res.status(400).json({ message: req.t('cannot_approve') });
    }
    transaction.status = 'confirmed';
    await transaction.save();
    res.json({ message: req.t('withdrawal_approved') });
  } catch (err) {
    res.status(500).json({ message: req.t('approval_error') });
  }
};

exports.declineWithdrawal = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findById(id).populate('userId');
    if (transaction.type !== 'withdrawal' || transaction.status !== 'pending') {
      return res.status(400).json({ message: req.t('cannot_decline') });
    }
    transaction.status = 'declined';
    transaction.userId.balance += transaction.amount;
    await transaction.userId.save();
    await transaction.save();
    res.json({ message: req.t('withdrawal_declined') });
  } catch (err) {
    res.status(500).json({ message: req.t('decline_error') });
  }
};

exports.setGameSettings = async (req, res) => {
  const { gameType, rtp } = req.body;
  if (!['poker', 'roulette', 'dice', 'slots'].includes(gameType) || rtp < 0 || rtp > 1) {
    return res.status(400).json({ message: req.t('invalid_game_settings') });
  }
  try {
    await GameSettings.findOneAndUpdate({ gameType }, { rtp }, { upsert: true });
    res.json({ message: req.t('game_settings_updated', { gameType, rtp }) });
  } catch (err) {
    res.status(500).json({ message: req.t('game_settings_error') });
  }
};