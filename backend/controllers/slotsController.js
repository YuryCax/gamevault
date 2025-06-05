const crypto = require('crypto');
const GameSettings = require('../models/GameSettings');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { addXP } = require('../utils/levelSystem');
const { logger } = require('../utils/logger');

const startSlotsGame = async (req, res) => {
  try {
    const { betAmount } = req.body;
    const userId = req.user._id;

    const settings = await GameSettings.findOne({ gameType: 'slots' });
    if (!settings) return res.status(400).json({ message: req.t('invalid_game_settings') });

    const user = await User.findById(userId);
    if (user.balance < betAmount) return res.status(400).json({ message: req.t('insufficient_funds', { amount: user.balance }) });

    const reels = Array.from({ length: 5 }, () =>
      Array.from({ length: 3 }, () => {
        const random = crypto.randomBytes(4).readUInt32LE(0) / 0xffffffff;
        const symbols = settings.specificSettings.slots.symbols;
        return symbols[Math.floor(random * symbols.length)];
      })
    );

    let payout = 0;
    let resultStatus = 'loss';
    let freeSpins = 0;
    let bonusGame = false;
    let jackpot = 0;

    const casinoWin = Math.random() < settings.casinoWinProbability / 100;
    if (!casinoWin) {
      // Проверка линий выплат
      const paylines = [
        [reels[0][0], reels[1][0], reels[2][0], reels[3][0], reels[4][0]], // Линия 1
        [reels[0][1], reels[1][1], reels[2][1], reels[3][1], reels[4][1]], // Линия 2
        [reels[0][2], reels[1][2], reels[2][2], reels[3][2], reels[4][2]], // Линия 3
      ];
      for (const line of paylines) {
        if (line.every(symbol => symbol === line[0])) {
          payout += betAmount * settings.maxPayoutMultiplier * (settings.rtp / 100);
          resultStatus = 'win';
        }
      }

      // Фриспины
      if (settings.specificSettings.slots.freeSpinsEnabled && Math.random() < 0.05) {
        freeSpins = 10;
      }

      // Бонусная игра
      if (settings.specificSettings.slots.bonusGamesEnabled && Math.random() < 0.03) {
        bonusGame = true;
        payout += betAmount * 5; // Пример бонуса
      }

      // Джекпот
      if (settings.specificSettings.slots.progressiveJackpotEnabled && Math.random() < 0.001) {
        jackpot = 10000; // Пример джекпота
        payout += jackpot;
        resultStatus = 'jackpot';
      }
    }

    user.balance -= betAmount;
    if (payout > 0) user.balance += payout;
    await user.save();

    const betTx = new Transaction({ user: userId, amount: -betAmount, type: 'bet', status: 'completed' });
    await betTx.save();

    if (payout > 0) {
      const payoutTx = new Transaction({ user: userId, amount: payout, type: 'payout', status: 'completed' });
      await payoutTx.save();
    }

    res.status(200).json({ reels, payout, resultStatus, freeSpins, bonusGame, jackpot, balance: user.balance });
  } catch (err) {
    logger.error(`Slots error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { startSlotsGame };