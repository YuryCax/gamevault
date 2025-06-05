const mongoose = require('mongoose');

const pokerTableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  players: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      isBot: { type: Boolean, default: false },
      balance: { type: Number, default: 0 },
      currentBet: { type: Number, default: 0 },
      cards: [{ suit: String, value: String }],
      status: { type: String, enum: ['active', 'folded', 'waiting'], default: 'waiting' },
    },
  ],
  pot: { type: Number, default: 0 },
  currentRound: { type: String, enum: ['preflop', 'flop', 'turn', 'river', 'showdown'], default: 'preflop' },
  communityCards: [{ suit: String, value: String }],
  isTournament: { type: Boolean, default: false },
  activePlayerIndex: { type: Number, default: 0 },
  lastBet: { type: Number, default: 0 },
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PokerTable', pokerTableSchema);