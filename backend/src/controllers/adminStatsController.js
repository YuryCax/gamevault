const User = require('../models/User');
const Transaction = require('../models/Transaction');
const CasinoBalance = require('../models/CasinoBalance');
const Table = require('../models/Table');
const { logger } = require('../utils/logger');

const getStats = async (req, res) => {
  try {
    // Общий баланс пользователей
    const userBalances = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]);
    const userTotalBalance = userBalances[0]?.total || 0;

    // Баланс казино
    const casinoBalance = await CasinoBalance.findOne() || { commission: 0, botWins: 0, casinoWins: 0 };
    const casinoTotal = casinoBalance.commission + casinoBalance.botWins + casinoBalance.casinoWins;

    // Общий баланс
    const totalBalance = userTotalBalance + casinoTotal;

    // Количество столов
    const tableCounts = await Table.aggregate([
      { $group: { _id: '$game', count: { $sum: 1 } } },
    ]);
    const tables = {
      poker: tableCounts.find(t => t._id === 'poker')?.count || 0,
      blackjack: tableCounts.find(t => t._id === 'blackjack')?.count || 0,
      roulette: tableCounts.find(t => t._id === 'roulette')?.count || 0,
    };

    // Количество игроков в кости и слотах
    const dicePlayers = await Transaction.distinct('user', { game: 'dice', createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
    const slotsPlayers = await Transaction.distinct('user', { game: 'slots', createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });

    res.status(200).json({
      totalBalance,
      casinoBalance: {
        commission: casinoBalance.commission,
        botWins: casinoBalance.botWins,
        casinoWins: casinoBalance.casinoWins,
        total: casinoTotal,
      },
      userTotalBalance,
      tables,
      players: {
        dice: dicePlayers.length,
        slots: slotsPlayers.length,
      },
    });
  } catch (err) {
    logger.error(`Stats error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { getStats };