const mongoose = require('mongoose');

const casinoBalanceSchema = new mongoose.Schema({
  commission: { type: Number, default: 0 }, // Комиссия казино
  botWins: { type: Number, default: 0 }, // Выигрыши ботов
  casinoWins: { type: Number, default: 0 }, // Победы казино (например, где нет RTP)
  total: { type: Number, default: 0 }, // Общий баланс
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CasinoBalance', casinoBalanceSchema);