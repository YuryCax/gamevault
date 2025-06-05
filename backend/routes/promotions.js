const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 50 });

router.post('/admin/bonuses', auth, limiter, promotionController.setDepositBonuses);
router.post('/admin/lottery', auth, limiter, promotionController.setLotterySettings);
router.get('/bonuses', limiter, promotionController.getBonuses);
router.get('/lottery', auth, limiter, promotionController.getLottery);
router.post('/lottery/buy', auth, limiter, promotionController.buyLotteryTickets);
router.get('/lottery/history', auth, limiter, promotionController.getLotteryHistory);
router.post('/admin/referral', auth, limiter, promotionController.setReferralPercentage);
router.get('/referral', auth, limiter, promotionController.getReferralStats);

module.exports = router;