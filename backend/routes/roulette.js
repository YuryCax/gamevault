const express = require('express');
const router = express.Router();
const { rouletteController } = require('../controllers/rouletteController');
const { protect } = require('../middleware/auth');

router.post('/play', protect, rouletteController.startRouletteGame);

module.exports = router;