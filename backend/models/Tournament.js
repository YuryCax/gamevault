const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gameType: { type: String, enum: ['poker', 'roulette', 'dice', 'slots', 'blackjack'], required: true },
  status: { type: String, enum: ['pending', 'ongoing', 'finished'], default: 'pending' },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  prizePool: { type: Number, default: 1000 },
  minPlayers: { type: Number, default: 10 },
  seasonId: { type: String, required: true },
  rankings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    points: { type: Number, default: 0 },
  }],
  createdAt: { type: Date, default: true },
});

module.exports = mongoose.model('Tournament', tournamentSchema);