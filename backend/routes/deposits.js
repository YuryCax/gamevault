const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const { protect } = require('../middleware/auth');

router.post('/check', protect, depositController.checkTransaction);
router.post('/withdraw', protect, depositController.withdraw);

module.exports = router;