const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
  cryptoEnabled: { type: Boolean, default: false },
  supportedCurrencies: [{
    currency: { type: String, enum: ['BTC', 'ETH', 'TRX', 'TON'] },
    enabled: { type: Boolean, default: true },
  }],
  coinbaseApiKey: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);