const express = require('express');
const router = express.Router();
const { slotsController } = require('../controllers/slotsController');
const { protect } = require('../middleware/auth');

router.post('/play', protect, slotsController.startSlotsGame);

module.exports = router;