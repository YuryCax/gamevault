const mongoose = require('mongoose');

const blackjackTableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bot: { type: Boolean, default: false },
    strategy: { type: String, enum: ['tight', 'aggressive', 'random'], default: 'random' },
    hand: [{ value: String, suit: String }],
    secondHand: [{ value: String, suit: String }], // Для Split
    bet: { type: Number, default: 0 },
    secondBet: { type: Number, default: 0 }, // Для Split
    insurance: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'stand', 'bust', 'surrender', 'blackjack'], default: 'active' },
    balance: { type: Number, default: 0 },
    lastActionTime: { type: Date },
  }],
  dealerHand: [{ value: String, suit: String }],
  deck: [{ value: String, suit: String }],
  pot: { type: Number, default: 0 },
  gameSettings: {
    deckCount: { type: Number, default: 6 },
    surrenderAllowed: { type: Boolean, default: true },
    insuranceAllowed: { type: Boolean, default: true },
    rtp: { type: Number, default: 99.5 },
    casinoWinProbability: { type: Number, default: 0.5 },
    botCount: { type: Number, default: 0 },
    botWinProbability: { type: Number, default: 45 },
    botStrategy: { type: String, enum: ['tight', 'aggressive', 'random'], default: 'random' },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BlackjackTable', blackjackTableSchema);