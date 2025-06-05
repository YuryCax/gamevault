const CoinbaseCommerce = require('coinbase-commerce-node');
const PaymentSettings = require('../models/PaymentSettings');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { logger } = require('../utils/logger');

const Client = CoinbaseCommerce.Client;
Client.init(process.env.COINBASE_API_KEY);

const createCryptoPayment = async (req, res) => {
  const { amount, currency } = req.body;
  try {
    const settings = await PaymentSettings.findOne();
    if (!settings || !settings.cryptoEnabled || !settings.supportedCurrencies.find(c => c.currency === currency && c.enabled)) {
      return res.status(400).json({ message: req.t('crypto_not_enabled') });
    }

    const charge = await CoinbaseCommerce.Charge.create({
      name: 'GameVault Deposit',
      description: `Deposit ${amount} ${currency}`,
      amount,
      currency,
      metadata: { userId: req.user._id },
    });

    await new Transaction({
      user: req.user._id,
      type: 'deposit_pending',
      amount,
      currency,
      transactionId: charge.id,
    }).save();

    res.status(200).json({ chargeUrl: charge.hosted_url });
  } catch (err) {
    logger.error(`Crypto payment error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const event = CoinbaseCommerce.Webhook.verifyEventBody(req.rawBody, req.headers['x-cc-webhook-signature'], process.env.COINBASE_WEBHOOK_SECRET);
    if (event.type === 'charge:confirmed') {
      const transaction = await Transaction.findOne({ transactionId: event.data.id });
      if (transaction && transaction.type === 'deposit_pending') {
        transaction.type = 'deposit';
        await transaction.save();
        const user = await User.findById(transaction.user);
        user.balance += transaction.amount;
        await user.save();
      }
    }
    res.status(200).send('OK');
  } catch (err) {
    logger.error(`Webhook error: ${err.message}`);
    res.status(400).send('Invalid webhook');
  }
};

module.exports = { createCryptoPayment, handleWebhook };