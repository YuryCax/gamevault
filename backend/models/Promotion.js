const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  type: { type: String, enum: ['deposit_bonus', 'cashback', 'referral', 'lottery'], required: true },
  name: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  settings: {
    bonusPercentage: { type: Number }, // For deposit_bonus
    minDeposit: { type: Number }, // For deposit_bonus
    cashbackPercentage: { type: Number }, // For cashback
    referralBonus: { type: Number }, // For referral
    lotteryFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'] }, // For lottery
    prizePool: { type: Number }, // For lottery
    ticketThreshold: { type: Number }, // USDT for 1 ticket
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  winners: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, prize: Number }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Promotion', promotionSchema);