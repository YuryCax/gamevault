const express = require('express');
const router = express.Router();
const { startBlackjackGame } = require('../controllers/blackjackController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /blackjack/start:
 *   post:
 *     summary: Start or continue a blackjack game
 *     tags: [Blackjack]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableId:
 *                 type: string
 *               betAmount:
 *                 type: number
 *               action:
 *                 type: string
 *                 enum: [hit, stand, double, split, surrender]
 *               secondBet:
 *                 type: number
 *     responses:
 *       200:
 *         description: Game updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 table:
 *                   type: object
 *                 balance:
 *                   type: number
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/start', protect, startBlackjackGame);

module.exports = router;