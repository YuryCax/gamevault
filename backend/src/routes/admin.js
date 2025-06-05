const express = require('express');
const router = express.Router();
const PaymentSettings = require('../models/PaymentSettings');
const Table = require('../models/Table');
const { getStats } = require('../controllers/adminStatsController');
const { protect, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get casino statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Casino statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBalance:
 *                   type: number
 *                 casinoBalance:
 *                   type: object
 *                   properties:
 *                     commission:
 *                       type: number
 *                     botWins:
 *                       type: number
 *                     casinoWins:
 *                       type: number
 *                     total:
 *                       type: number
 *                 userTotalBalance:
 *                   type: number
 *                 tables:
 *                   type: object
 *                   properties:
 *                     poker:
 *                       type: number
 *                     blackjack:
 *                       type: number
 *                     roulette:
 *                       type: number
 *                 players:
 *                   type: object
 *                   properties:
 *                     dice:
 *                       type: number
 *                     slots:
 *                       type: number
 */
router.get('/stats', protect, isAdmin, getStats);

/**
 * @swagger
 * /admin/payment-settings:
 *   get:
 *     summary: Get payment settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cryptoEnabled:
 *                   type: boolean
 *                 supportedCurrencies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       currency:
 *                         type: string
 *                       enabled:
 *                         type: boolean
 *                 coinbaseApiKey:
 *                   type: string
 */
router.get('/payment-settings', protect, isAdmin, async (req, res) => {
  try {
    const settings = await PaymentSettings.findOne() || {};
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

/**
 * @swagger
 * /admin/payment-settings:
 *   put:
 *     summary: Update payment settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cryptoEnabled:
 *                 type: boolean
 *               supportedCurrencies:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     currency:
 *                       type: string
 *                     enabled:
 *                       type: boolean
 *               coinbaseApiKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/payment-settings', protect, isAdmin, async (req, res) => {
  try {
    await PaymentSettings.findOneAndUpdate({}, req.body, { upsert: true });
    res.status(200).json({ message: req.t('payment_settings_updated') });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

/**
 * @swagger
 * /admin/game-settings:
 *   put:
 *     summary: Update game settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               game:
 *                 type: string
 *               settings:
 *                 type: object
 *                 properties:
 *                   botWinProbability:
 *                     type: number
 *                   enabled:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put('/game-settings', protect, isAdmin, async (req, res) => {
  try {
    const { game, settings } = req.body;
    await Table.updateMany({ game }, { $set: { 'settings.botWinProbability': settings.botWinProbability } });
    res.status(200).json({ message: req.t('settings_updated') });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

module.exports = router;