const express = require('express');
const router = express.Router();
const { createCryptoPayment, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /payment/crypto:
 *   post:
 *     summary: Create a crypto payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [BTC, ETH, TRX, TON]
 *     responses:
 *       200:
 *         description: Payment URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chargeUrl:
 *                   type: string
 */
router.post('/crypto', protect, createCryptoPayment);

/**
 * @swagger
 * /payment/webhook:
 *   post:
 *     summary: Handle Coinbase webhook
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/webhook', handleWebhook);

module.exports = router;