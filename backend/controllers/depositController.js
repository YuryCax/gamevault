const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Promotion = require('../models/Promotion');
const Referral = require('../models/Referral');
const ethers = require('ethers');
const TronWeb = require('tronweb');
const { logger } = require('../utils/logger');

const ETHEREUM_NODE = 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY';
const TRON_NODE = 'https://api.trongrid.io';
const USDT_CONTRACT_ETHEREUM = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_CONTRACT_TRON = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

exports.deposit = async (req, res) => {
  const { amount, network, txHash } = req.body;
  if (!amount || amount <= 0 || !['ethereum', 'tron'].includes(network) || !txHash) {
    return res.status(400).json({ message: req.t('invalid_data') });
  }
  try {
    let isValidTx = false;
    let txAmount = 0;
    if (network === 'ethereum') {
      const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_NODE);
      const tx = await provider.getTransaction(txHash);
      if (tx && tx.to === USDT_CONTRACT_ETHEREUM) {
        const iface = new ethers.utils.Interface(['function transfer(address to, uint256 value)']);
        const decoded = iface.decodeFunctionData('transfer', tx.data);
        if (decoded.to === process.env.WALLET_ADDRESS) {
          txAmount = ethers.utils.formatUnits(decoded.value, 6);
          isValidTx = txAmount >= amount;
        }
      }
    } else if (network === 'tron') {
      const tronWeb = new TronWeb({ fullHost: TRON_NODE });
      const tx = await tronWeb.trx.getTransaction(txHash);
      if (tx && tx.raw_data.contract[0].parameter.value.contract_address === USDT_CONTRACT_TRON) {
        const toAddress = tronWeb.address.fromHex(tx.raw_data.contract[0].parameter.value.to_address);
        if (toAddress === process.env.WALLET_ADDRESS) {
          txAmount = tx.raw_data.contract[0].parameter.value.amount / 1e6;
          isValidTx = txAmount >= amount;
        }
      }
    }
    if (!isValidTx) {
      return res.status(400).json({ message: req.t('invalid_transaction') });
    }
    const user = await User.findById(req.user._id);
    const promotion = await Promotion.findOne({ type: 'deposit' });
    let bonus = 0;
    if (promotion && promotion.settings.tiers) {
      const tier = promotion.settings.tiers
        .filter(t => amount >= t.amount)
        .sort((a, b) => b.amount - a.amount)[0];
      if (tier) bonus = amount * (tier.bonusPercentage / 100);
    }
    const lotterySettings = await Promotion.findOne({ type: 'lottery' });
    const ticketsPer100USDT = lotterySettings ? lotterySettings.settings.ticketsPer100USDT : 2;
    const additionalTickets = Math.floor(amount / 100) * ticketsPer100USDT;
    user.balance += amount + bonus;
    user.availableLotteryTickets += additionalTickets;
    await user.save();
    await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount,
      network,
      txHash,
      status: 'completed',
    });
    if (user.referredBy) {
      const referralPromotion = await Promotion.findOne({ type: 'referral' });
      const referralPercentage = referralPromotion ? referralPromotion.settings.percentage : 0;
      const referralBonus = amount * (referralPercentage / 100);
      await User.findByIdAndUpdate(user.referredBy, { $inc: { balance: referralBonus } });
      await Referral.findOneAndUpdate(
        { user: user.referredBy, referredUser: req.user._id },
        { $inc: { earnings: referralBonus } },
        { upsert: true }
      );
    }
    res.json({ message: req.t('deposit_successful'), balance: user.balance, bonus, tickets: additionalTickets });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: req.t('transaction_check_error') });
  }
};

exports.withdraw = async (req, res) => {
  const { amount, network, address } = req.body;
  if (!amount || amount <= 0 || !['ethereum', 'tron'].includes(network) || !address) {
    return res.status(400).json({ message: req.t('invalid_data') });
  }
  try {
    const user = await User.findById(req.user._id);
    if (user.balance < amount) {
      return res.status(400).json({ message: req.t('insufficient_funds') });
    }
    await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount,
      network,
      address,
      status: 'pending',
    });
    res.json({ message: req.t('withdrawal_requested') });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ message: req.t('withdrawal_request_error') });
  }
};