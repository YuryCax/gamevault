const crypto = require('crypto');
const GameSettings = require('../models/GameSettings');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { addXP } = require('../utils/levelSystem');
const { logger } = require('../utils/logger');

const startRouletteGame = async (req, res) => {
  try {
    const { betAmount, betType, betValue } = req.body;
    const userId = req.user._id;

    const settings = await GameSettings.findOne({ gameType: 'roulette' });
    if (!settings) return res.status(400).json({ message: req.t('invalid_game_settings') });

    const user = await User.findById(userId);
    if (user.balance < betAmount) return res.status(400).json({ message: req.t('insufficient_funds', { amount: user.balance }) });

    // Колесо
    const wheel = Array.from({ length: 37 }, (_, i) => ({
      number: i,
      color: i === 0 ? 'green' : i % 2 === 0 ? 'black' : 'red',
    }));
    let resultIndex;
    if (settings.specificSettings.roulette.realisticWheelEnabled) {
      const weights = Array(37).fill(1);
      weights[0] = 1.5; // Зеро чаще
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = crypto.randomBytes(4).readUInt32LE(0) / 0xffffffff * totalWeight;
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          resultIndex = i;
          break;
        }
      }
    } else {
      resultIndex = Math.floor(crypto.randomBytes(4).readUInt32LE(0) / 0xffffffff * 37);
    }
    const result = wheel[resultIndex];

    let payout = 0;
    let resultStatus = 'loss';

    const casinoWin = Math.random() < settings.casinoWinProbability / 100;
    if (!casinoWin) {
      if (betType === 'number' && Number(betValue) === result.number) {
        payout = betAmount * settings.specificSettings.roulette.betTypes.number;
        resultStatus = 'win';
      } else if (betType === 'color' && betValue === result.color) {
        payout = betAmount * settings.specificSettings.roulette.betTypes.color;
        resultStatus = 'win';
      } else if (betType === 'evenOdd' && betValue === (result.number % 2 === 0 ? 'even' : 'odd') && result.number !== 0) {
        payout = betAmount * settings.specificSettings.roulette.betTypes.evenOdd;
        resultStatus = 'win';
      } else if (betType === 'dozen' && betValue === Math.floor(result.number / 12) + 1 && result.number !== 0) {
        payout = betAmount * settings.specificSettings.roulette.betTypes.dozen;
        resultStatus = 'win';
      } else if (betType === 'column' && betValue === (result.number % 3 === 0 ? 3 : result.number % 3) && result.number !== 0) {
        payout = betAmount * settings.specificSettings.roulette.betTypes.column;
        resultStatus = 'win';
      } else if (betType === 'split' && betValue.split('-').includes(result.number.toString())) {
        payout = betAmount * settings.specificSettings.roulette.betTypes.split;
        resultStatus = 'win';
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

    res.status(200).json({ result, payout, resultStatus, balance: user.balance });
  } catch (err) {
    logger.error(`Roulette error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { startRouletteGame };