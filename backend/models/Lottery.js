const mongoose = require('mongoose');

const lotterySchema = new mongoose.Schema({
  drawDate: { type: Date, required: true },
  tickets: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    count: { type: Number, required: true, min: 1 },
  }],
  winners: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    prize: { type: Number },
  }],
  prizePool: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
}, { timestamps: true });

lotterySchema.index({ drawDate: 1, status: 1 });

module.exports = mongoose.model('Lottery', lotterySchema);