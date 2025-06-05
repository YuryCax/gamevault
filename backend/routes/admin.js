const express = require('express');
const router = express.Router();
const PaymentSettings = require('../models/PaymentSettings');
const { protect, isAdmin } = require('../middleware/auth');

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
 *   put:
 *     summary: Update payment settings
 *     tags: requestBody:
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
 */
router.get('/payment-settings', protect, isAdmin, async (req, res) => {
  try {
    const settings = await PaymentSettings.findOne() || {};
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

router.put('/payment-settings', protect, async (req, res) => {
  try {
    await PaymentSettings.findOneAndUpdate({}, req.body, { upsert: true });
    res.status(200).json({ message: req.t('payment_settings_updated') });
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

module.exports = router;