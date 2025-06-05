const express = require('express');
const router = express.Router();
const { startRouletteGame } = require('../controllers/rouletteController');
const { protect } = require('...middleware/auth');

/**
 * @swagger
 * /roulette/start:
*   post:
*     summary: Start or continue a roulette game
*     tags: [Roulette]
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
*               betType:
*                 type: string
*                 enum: [number, color]
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
*                 result:
*                   type: number
*                 payout:
*                   type: number
*                 balance:
*                   type: number
*/
router.post('/start', protect, startRouletteGame);

module.exports = router;