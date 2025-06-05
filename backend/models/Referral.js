const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

referralSchema.index({ user: 1, referredUser: 1 }, { unique: true });

module.exports = mongoose.model('Referral', referralSchema);