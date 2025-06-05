const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'bet', 'payout'], required: true },
  txHash: { type: String, unique: true, sparse: true }, // Уникальный хэш транзакции
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ txHash: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);