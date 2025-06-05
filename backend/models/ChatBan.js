const mongoose = require('mongoose');

const chatBanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  bannedUntil: { type: Date, required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

chatBanSchema.index({ user: 1, tournament: 1 }, { unique: true });

module.exports = mongoose.model('ChatBan', chatBanSchema);