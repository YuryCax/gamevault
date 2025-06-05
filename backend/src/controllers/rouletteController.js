const Table = require('../models/Table');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const CasinoBalance = require('../models/CasinoBalance');
const { logger } = require('../utils/logger');

const startRouletteGame = async (req, res) => {
  const { tableId, betAmount, betType } = req.body;
  try {
    let table = await Table.findById(tableId);
    if (!table) {
      table = await Table.create({
        game: 'roulette',
        players: [{ user: req.user._id, isBot: false }],
        maxPlayers: 5,
      });
    } else if (table.players.length >= table.maxPlayers) {
      return res.status(400).json({ message: req.t('table_full') });
    } else if (!table.players.some(p => p.user.equals(req.user._id))) {
      table.players.push({ user: req.user._id, isBot: false });
      await table.save();
    }

    // Добавление ботов, если игроков меньше 5
    while (table.players.length < table.maxPlayers) {
      table.players.push({ isBot: true });
      await table.save();
    }

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount) {
      return res.status(400).json({ message: req.t('insufficient_balance') });
    }

    // Симуляция рулетки
    const result = Math.floor(Math.random() * 37); // 0-36
    let payout = 0;
    if (betType === 'number' && result === Number(betAmount)) {
      payout = betAmount * 35;
    } else if (betType === 'color' && ((result % 2 === 0 && betType === 'red') || (result % 2 !== 0 && betType === 'black'))) {
      payout = betAmount * 2;
    }

    // Боты
    let botWins = 0;
    for (const player of table.players.filter(p => p.isBot)) {
      if (Math.random() < table.settings.botWinProbability) {
        botWins += betAmount * 2; // Пример: боты выигрывают удвоенную ставку
      }
    }

    // Обновление балансов
    user.balance += payout - betAmount;
    await user.save();

    const casinoBalance = await CasinoBalance.findOne() || new CasinoBalance();
    if (payout > 0) {
      casinoBalance.casinoWins -= payout;
    } else {
      casinoBalance.casinoWins += betAmount;
    }
    casinoBalance.botWins += botWins;
    casinoBalance.commission += betAmount * 0.05; // 5% комиссия
    casinoBalance.total = casinoBalance.commission + casinoBalance.botWins + casinoBalance.casinoWins;
    await casinoBalance.save();

    await new Transaction({
      user: req.user._id,
      type: payout > 0 ? 'win' : 'loss',
      amount: betAmount,
      currency: 'USD',
      transactionId: `roulette-${Date.now()}`,
      game: 'roulette',
      table: table._id,
    }).save();

    if (botWins > 0) {
      await new Transaction({
        type: 'bot_win',
        amount: botWins,
        currency: 'USD',
        transactionId: `bot-${Date.now()}`,
        game: 'roulette',
        table: table._id,
      }).save();
    }

    res.status(200).json({ table, result, payout, balance: user.balance });
  } catch (err) {
    logger.error(`Roulette error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { startRouletteGame };