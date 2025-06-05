const crypto = require('crypto');
const GameSettings = require('../models/GameSettings');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { addXP } = require('../utils/levelSystem');
const { logger } = require('../utils/logger');

const startDiceGame = async (req, res) => {
  try {
    const { betAmount, betMode, betValue } = req.body;
    const userId = req.user._id;

    const settings = await GameSettings.findOne({ gameType: 'dice' });
    if (!settings) return res.status(400).json({ message: req.t('invalid_game_settings') });

    const user = await User.findById(userId);
    if (user.balance < betAmount) return res.status(400).json({ message: req.t('insufficient_funds', { amount: user.balance }) });

    const roll = [
      Math.floor(crypto.randomBytes(1).readUInt8(0) / 256 * 6) + 1,
      Math.floor(crypto.randomBytes(1).readUInt8(0) / 256 * 6) + 1,
    ];
    const sum = roll[0] + roll[1];

    let payout = 0;
    let resultStatus = 'loss';
    let bonusRound = false;

    const casinoWin = Math.random() < settings.casinoWinProbability / 100;
    if (!casinoWin) {
      if (betMode === 'exact' && sum === Number(betValue)) {
        payout = betAmount * settings.specificSettings.dice.betModes.exact;
        resultStatus = 'win';
      } else if (betMode === 'overUnder' && betValue === 'over' && sum > 6) {
        payout = betAmount * settings.specificSettings.dice.betModes.overUnder;
        resultStatus = 'win';
      } else if (betMode === 'overUnder' && betValue === 'under' && sum < 6) {
        payout = betAmount * settings.specificSettings.dice.betModes.overUnder;
        resultStatus = 'win';
      } else if (betMode === 'pair' && roll[0] === roll[1]) {
        payout = betAmount * settings.specificSettings.dice.betModes.pair;
        resultStatus = 'win';
      } else if (betMode === 'sum7or11' && [7, 11].includes(sum)) {
        payout = betAmount * settings.specificSettings.dice.betModes.sum7or11;
        resultStatus = 'win';
      }
    }

    if (settings.specificSettings.dice.bonusRoundsEnabled && resultStatus === 'win' && Math.random() < 0.1) {
      bonusRound = true;
      payout *= 2; // Двойной выигрыш
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

    res.status(200).json({ roll, sum, payout, resultStatus, bonusRound, balance: user.balance });
  } catch (err) {
    logger.error(`Dice error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { startDiceGame };