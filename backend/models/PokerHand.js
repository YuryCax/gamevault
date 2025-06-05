const mongoose = require('mongoose');

const pokerHandSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'PokerTable', required: true },
  cards: [{ suit: String, value: String }], // Пример: [{ suit: 'hearts', value: 'A' }]
  combination: {
    type: String,
    enum: [
      'royalFlush',
      'straightFlush',
      'fourOfAKind',
      'fullHouse',
      'flush',
      'straight',
      'threeOfAKind',
      'twoPair',
      'onePair',
      'highCard',
    ],
  },
  strength: { type: Number }, // Числовое значение для сравнения
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PokerHand', pokerHandSchema);