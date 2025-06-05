const Promotion = require('../models/Promotion');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { logger } = require('../utils/logger');

const applyPromotion = async (req, res) => {
  const { promotionId } = req.body;
  try {
    const promotion = await Promotion.findById(promotionId);
    if (!promotion || !promotion.enabled) return res.status(400).json({ message: req.t('invalid_promotion') });

    const user = await User.findById(req.user._id);
    if (promotion.participants.includes(req.user._id)) {
      return res.status(400).json({ message: req.t('already_participated') });
    }

    if (promotion.type === 'deposit_bonus') {
      const { minDeposit, bonusPercentage } = promotion.settings;
      const lastDeposit = await Transaction.findOne({ user: req.user._id, type: 'deposit' }).sort({ createdAt: -1 });
      if (!lastDeposit || lastDeposit.amount < minDeposit) {
        return res.status(400).json({ message: req.t('min_deposit_required', { amount: minDeposit }) });
      }
      const bonus = lastDeposit.amount * (bonusPercentage / 100);
      user.balance += bonus;
      await user.save();
      await new Transaction({ user: req.user._id, type: 'bonus', amount: bonus }).save();
    } else if (promotion.type === 'lottery') {
      const totalBets = await Transaction.aggregate([
        { $match: { user: req.user._id, type: 'game_bet', createdAt: { $gte: promotion.startDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const tickets = Math.floor(totalBets[0]?.total / promotion.settings.ticketThreshold);
      if (tickets > 0) {
        promotion.participants.push(req.user._id);
        await promotion.save();
      }
    }

    res.status(200).json({ message: req.t('promotion_applied') });
  } catch (err) {
    logger.error(`Promotion error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

const drawLottery = async (promotionId) => {
  try {
    const promotion = await Promotion.findById(promotionId).populate('participants');
    if (!promotion || promotion.type !== 'lottery') return;

    const winner = promotion.participants[Math.floor(Math.random() * promotion.participants.length)];
    const prize = promotion.settings.prizePool * 0.5; // 50% to one winner
    promotion.winners.push({ user: winner._id, prize });
    await promotion.save();

    const user = await User.findById(winner._id);
    user.balance += prize;
    await user.save();
    await new Transaction({ user: winner._id, type: 'lottery_win', amount: prize }).save();
  } catch (err) {
    logger.error(`Lottery draw error: ${err.message}`);
  }
};

module.exports = { applyPromotion, drawLottery };