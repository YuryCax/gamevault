const crypto = require('crypto');
const redis = require('redis');
const GameHistory = require('../models/GameHistory');
const GameSettings = require('../models/GameSettings');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { addXP } = require('../utils/levelSystem');
const { logger } = require('../utils/logger');

const client = redis.createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
client.on('error', (err) => logger.error(`Redis error: ${err}`));

const startGame = async (req, res) => {
  try {
    const { gameType, betAmount, txHash } = req.body;
    const userId = req.user._id;

    // Валидация txHash
    if (txHash) {
      const existingTx = await Transaction.findOne({ txHash });
      if (existingTx) {
        return res.status(400).json({ message: req.t('invalid_transaction') });
      }
    }

    // Получить настройки из Redis или MongoDB
    let settings;
    const cacheKey = `gameSettings:${gameType}`;
    const cachedSettings = await client.get(cacheKey);
    if (cachedSettings) {
      settings = JSON.parse(cachedSettings);
    } else {
      settings = await GameSettings.findOne({ gameType });
      if (!settings) {
        return res.status(400).json({ message: req.t('invalid_game_settings') });
      }
      await client.setEx(cacheKey, 3600, JSON.stringify(settings));
    }

    // Проверка баланса
    const user = await User.findById(userId);
    if (user.balance < betAmount) {
      return res.status(400).json({ message: req.t('insufficient_funds') });
    }

    // RNG логика
    const random = crypto.randomBytes(4).readUInt32LE(0) / 0xffffffff;
    let payout = 0;
    let result = 'loss';

    const volatilityFactor = {
      low: 1,
      medium: 2,
      high: 5,
    }[settings.volatility];

    if (random < settings.winProbability) {
      const maxPayout = betAmount * settings.maxPayoutMultiplier;
      payout = betAmount * (settings.rtp / 100) * volatilityFactor * (1 + random);
      payout = Math.min(payout, maxPayout);
      result = 'win';
    }

    // Обновить баланс
    user.balance -= betAmount;
    if (payout > 0) {
      user.balance += payout;
    }
    await user.save();

    // Сохранить транзакции
    const betTx = new Transaction({
      user: userId,
      amount: -betAmount,
      type: 'bet',
      txHash,
      status: 'completed',
    });
    await betTx.save();

    if (payout > 0) {
      const payoutTx = new Transaction({
        user: userId,
        amount: payout,
        type: 'payout',
        status: 'completed',
      });
      await payoutTx.save();
    }

    // Сохранить историю игры
    const gameHistory = new GameHistory({
      user: userId,
      gameType,
      betAmount,
      payout,
      result,
    });
    await gameHistory.save();

    // Начислить XP
    await addXP(userId, Math.floor(betAmount * 10));

    res.status(200).json({ payout, result, balance: user.balance });
  } catch (err) {
    logger.error(`Game error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { startGame };