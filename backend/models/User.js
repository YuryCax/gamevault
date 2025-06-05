const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  gdprConsent: {
    accepted: { type: Boolean, default: false },
    timestamp: { type: Date },
  },
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  tournamentPoints: { type: Number, default: 0 },
  seasonHistory: [{
    seasonId: { type: String, required: true },
    points: { type: Number, default: 0 },
    rank: { type: Number },
    rewards: { type: Number, default: 0 },
    endAt: { type: Date },
  }],
  settings: {
    interactiveGuides: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);