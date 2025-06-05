const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ tournament: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);