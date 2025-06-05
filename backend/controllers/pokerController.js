const crypto = require('crypto');
const redis = require('redis');
const PokerHand = require('../models/PokerHand');
const PokerTable = require('../models/PokerTable');
const GameSettings = require('../models/GameSettings');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { addXP } = require('../utils/levelSystem');
const { logger } = require('../utils/logger');

const client = redis.createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
client.on('error', (err) => logger.error(`Redis error: ${err}`));

const evaluateHand = (cards) => {
  const values = cards.map(c => c.value).sort((a, b) => {
    const order = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return order.indexOf(b) - order.indexOf(a);
  });
  const suits = cards.map(c => c.suit);
  const valueCounts = values.reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {});
  const isFlush = new Set(suits).size === 1;
  const isStraight = values.every((v, i) => i === 0 || order.indexOf(v) === order.indexOf(values[i - 1]) - 1);

  let combination = 'highCard';
  let strength = 1;
  let highCard = values[0];

  if (isFlush && isStraight && values[0] === 'A') {
    combination = 'royalFlush';
    strength = 10;
  } else if (isFlush && isStraight) {
    combination = 'straightFlush';
    strength = 9;
  } else if (Object.values(valueCounts).includes(4)) {
    combination = 'fourOfAKind';
    strength = 8;
    highCard = Object.keys(valueCounts).find(k => valueCounts[k] === 4);
  } else if (Object.values(valueCounts).includes(3) && Object.values(valueCounts).includes(2)) {
    combination = 'fullHouse';
    strength = 7;
    highCard = Object.keys(valueCounts).find(k => valueCounts[k] === 3);
  } else if (isFlush) {
    combination = 'flush';
    strength = 6;
  } else if (isStraight) {
    combination = 'straight';
    strength = 5;
  } else if (Object.values(valueCounts).includes(3)) {
    combination = 'threeOfAKind';
    strength = 4;
    highCard = Object.keys(valueCounts).find(k => valueCounts[k] === 3);
  } else if (Object.keys(valueCounts).filter(k => valueCounts[k] === 2).length === 2) {
    combination = 'twoPair';
    strength = 3;
    highCard = Object.keys(valueCounts).filter(k => valueCounts[k] === 2).sort((a, b) => order.indexOf(b) - order.indexOf(a))[0];
  } else if (Object.values(valueCounts).includes(2)) {
    combination = 'onePair';
    strength = 2;
    highCard = Object.keys(valueCounts).find(k => valueCounts[k] === 2);
  }

  return { combination, strength, highCard };
};

const startPokerGame = async (req, res) => {
  try {
    const { tableId, betAmount, action } = req.body;
    const userId = req.user._id;

    const settings = await GameSettings.findOne({ gameType: 'poker' });
    if (!settings) return res.status(400).json({ message: req.t('invalid_game_settings') });

    const table = await PokerTable.findById(tableId);
    if (!table || table.status !== 'active') return res.status(400).json({ message: req.t('invalid_table') });

    const player = table.players.find(p => p.user.toString() === userId.toString());
    if (!player || player.status !== 'active') return res.status(400).json({ message: req.t('not_active_player') });

    const user = await User.findById(userId);
    if (user.balance < betAmount) return res.status(400).json({ message: req.t('insufficient_funds', { amount: user.balance }) });

    // Блайнды
    if (settings.specificSettings.poker.blindsEnabled && table.currentRound === 'preflop') {
      const smallBlindIndex = table.dealerIndex + 1;
      const bigBlindIndex = table.dealerIndex + 2;
      if (table.players[smallBlindIndex]?.user.toString() === userId.toString()) {
        const smallBlind = 10;
        if (user.balance < smallBlind) return res.status(400).json({ message: req.t('insufficient_funds') });
        player.currentBet += smallBlind;
        table.pot += smallBlind;
        user.balance -= smallBlind;
      }
      if (table.players[bigBlindIndex]?.user.toString() === userId.toString()) {
        const bigBlind = 20;
        if (user.balance < bigBlind) return res.status(400).json({ message: req.t('insufficient_funds') });
        player.currentBet += bigBlind;
        table.pot += bigBlind;
        user.balance -= bigBlind;
      }
    }

    // Таймер
    const timeLimit = table.isTournament ? settings.specificSettings.poker.betTimeTournament : settings.specificSettings.poker.betTimeNormal;
    if (Date.now() > player.lastActionTime + timeLimit * 1000) {
      action = table.lastBet === 0 ? 'check' : 'fold';
      if (action === 'fold') player.status = 'folded';
    }

    // Действия
    if (action === 'fold') {
      player.status = 'folded';
    } else if (action === 'check' && table.lastBet === 0) {
      player.currentBet = 0;
    } else if (action === 'call' || action === 'raise') {
      if (betAmount < table.lastBet && action === 'call') return res.status(400).json({ message: req.t('invalid_bet') });
      player.currentBet = betAmount;
      table.pot += betAmount;
      user.balance -= betAmount;
      table.lastBet = betAmount;
    }

    player.lastActionTime = Date.now();
    table.activePlayerIndex = (table.activePlayerIndex + 1) % table.players.length;

    // Боты
    const bots = table.players.filter(p => p.isBot && p.status === 'active');
    for (const bot of bots) {
      const random = crypto.randomBytes(4).readUInt32LE(0) / 0xffffffff;
      let botAction = 'fold';
      if (settings.specificSettings.poker.botStrategy === 'tight' && random < 0.3) {
        botAction = 'call';
      } else if (settings.specificSettings.poker.botStrategy === 'aggressive' && random < 0.7) {
        botAction = random < 0.4 ? 'raise' : 'call';
      } else if (random < settings.specificSettings.poker.botWinProbability / 100) {
        botAction = 'call';
      }
      if (botAction === 'call') {
        bot.currentBet = table.lastBet;
        table.pot += bot.currentBet;
        bot.balance -= bot.currentBet;
      } else if (botAction === 'raise') {
        bot.currentBet = table.lastBet + 50;
        table.pot += bot.currentBet;
        bot.balance -= bot.currentBet;
        table.lastBet = bot.currentBet;
      } else {
        bot.status = 'folded';
      }
    }

    // Проверка окончания
    if (table.players.filter(p => p.status === 'active').length <= 1) {
      table.status = 'finished';
      const winner = table.players.find(p => p.status === 'active');
      const commission = table.pot * (settings.specificSettings.poker.commission / 100);
      winner.balance += table.pot - commission;

      const payoutTx = new Transaction({
        user: winner.user,
        amount: table.pot - commission,
        type: 'payout',
        status: 'completed',
      });
      await payoutTx.save();

      // Сохранение в Redis
      await client.set(`table:${tableId}`, JSON.stringify(table));
    }

    await table.save();
    await user.save();

    // Уведомления
    if (settings.features.notificationsEnabled) {
      // AWS SNS (см. ниже)
    }

    res.status(200).json({ table, balance: user.balance });
  } catch (err) {
    logger.error(`Poker error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { startPokerGame };