const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  game: { type: String, enum: ['poker', 'blackjack', 'roulette'], required: true },
  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isBot: { type: Boolean, default: false },
  }],
  maxPlayers: { type: Number, default: 5 },
  status: { type: String, enum: ['waiting', 'active', 'finished'], default: 'waiting' },
  settings: {
    botWinProbability: { type: Number, default: 0.6, min: 0, max: 1 }, // Вероятность победы ботов (0-1)
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Table', tableSchema);