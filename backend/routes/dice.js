const express = express();
const router = express.Router();
const { diceController } = require('../controllers/diceController');
const { protect } = require('../middleware/auth');

router.post('/play', protect, diceController.startDiceGame);

module.exports = router;