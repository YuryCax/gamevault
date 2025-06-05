const mongoose = require('mongoose');

const gameHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameType: { type: String, enum: ['slots', 'poker', 'roulette', 'dice'], required: true },
  betAmount: { type: Number, required: true },
  payout: { type: Number, default: 0 },
  result: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

gameHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('GameHistory', gameHistorySchema);