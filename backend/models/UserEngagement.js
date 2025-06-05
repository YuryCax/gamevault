const mongoose = require('mongoose');

const userEngagementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dailyBonus: {
    lastClaimed: { type: Date },
    streak: { type: Number, default: 0 },
    bonusAmount: { type: Number, default: 10 },
  },
  missions: [{
    name: { type: String, required: true },
    description: { type: String },
    progress: { type: Number, default: 0 },
    target: { type: Number, required: true },
    reward: { type: Number, required: true },
    completed: { type: Boolean, default: false },
  }],
  achievements: [{
    name: { type: String, required: true },
    description: { type: String },
    reward: { type: Number },
    unlocked: { type: Boolean, default: false },
    unlockedAt: { type: Date },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserEngagement', userEngagementSchema);