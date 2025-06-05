const BlackjackTable = require('../models/BlackjackTable');
const GameSettings = require('../models/GameSettings');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { logger } = require('../utils/logger');

const getCardValue = (card) => {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11; // Adjust later for soft/hard
  return parseInt(card.value);
};

const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;
  hand.forEach(card => {
    if (card.value === 'A') aces++;
    else value += getCardValue(card);
  });
  while (aces > 0) {
    value += (value + 11 <= 21) ? 11 : 1;
    aces--;
  }
  return value;
};

const startBlackjackGame = async (req, res) => {
  const { tableId, betAmount, action, secondBet } = req.body;
  try {
    const settings = await GameSettings.findOne({ gameType: 'blackjack' });
    if (!settings) return res.status(400).json({ message: req.t('invalid_game_settings') });

    const table = await BlackjackTable.findById(tableId).populate('players.user');
    if (!table || table.status !== 'active') return res.status(400).json({ message: req.t('invalid_table') });

    const player = table.players.find(p => p.user._id.toString() === req.user._id.toString());
    if (!player || player.status !== 'active') return res.status(400).json({ message: req.t('not_active_player') });

    const user = await User.findById(req.user._id);
    if (user.balance < betAmount) return res.status(400).json({ message: req.t('insufficient_funds', { amount: user.balance }) });

    if (!['hit', 'stand', 'double', 'split', 'surrender'].includes(action)) {
      return res.status(400).json({ message: req.t('invalid_action') });
    }

    if (action === 'hit') {
      const card = table.deck.pop();
      player.hand.push(card);
      const handValue = calculateHandValue(player.hand);
      if (handValue > 21) player.status = 'bust';
    } else if (action === 'stand') {
      player.status = 'stand';
    } else if (action === 'double') {
      if (user.balance < betAmount * 2) return res.status(400).json({ message: req.t('insufficient_funds', { amount: user.balance }) });
      player.bet *= 2;
      const card = table.deck.pop();
      player.hand.push(card);
      player.status = 'stand';
    } else if (action === 'split') {
      if (player.hand.length !== 2 || player.hand[0].value !== player.hand[1].value) {
        return res.status(400).json({ message: req.t('invalid_split') });
      }
      player.secondHand = [player.hand.pop()];
      player.secondBet = betAmount;
      player.hand.push(table.deck.pop());
      player.secondHand.push(table.deck.pop());
    } else if (action === 'surrender' && settings.surrenderAllowed) {
      player.status = 'surrender';
      user.balance += betAmount / 2;
    }

    if (player.status === 'bust' || player.status === 'stand' || player.status === 'surrender') {
      // Process dealer and payouts
      while (calculateHandValue(table.dealerHand) < 17) {
        table.dealerHand.push(table.deck.pop());
      }
      const dealerValue = calculateHandValue(table.dealerHand);

      if (player.status !== 'surrender') {
        const handValue = calculateHandValue(player.hand);
        let payout = 0;
        if (handValue <= 21 && (dealerValue > 21 || handValue > dealerValue)) {
          payout = player.bet * (handValue === 21 && player.hand.length === 2 ? 2.5 : 2);
        } else if (handValue === dealerValue && handValue <= 21) {
          payout = player.bet;
        }
        user.balance += payout;
        await user.save();
        await new Transaction({
          user: req.user._id,
          type: 'game_result',
          amount: payout - player.bet,
          gameType: 'blackjack',
        }).save();
      }

      if (player.secondHand.length > 0) {
        const secondHandValue = calculateHandValue(player.secondHand);
        let secondPayout = 0;
        if (secondHandValue <= 21 && (dealerValue > 21 || secondHandValue > dealerValue)) {
          secondPayout = player.secondBet * (secondHandValue === 21 && player.secondHand.length === 2 ? 2.5 : 2);
        } else if (secondHandValue === dealerValue && secondHandValue <= 21) {
          secondPayout = player.secondBet;
        }
        user.balance += secondPayout;
        await user.save();
        await new Transaction({
          user: req.user._id,
          type: 'game_result',
          amount: secondPayout - player.secondBet,
          gameType: 'blackjack',
        }).save();
      }
    }

    await table.save();
    res.status(200).json({ table, balance: user.balance });
  } catch (err) {
    logger.error(`Blackjack error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { startBlackjackGame };