const express = require('express');
const router = express.Router();
const { pokerController } = require('../controllers/pokerController');
const { protect } = require('../middleware/auth');

router.post('/play', protect, pokerController.startPokerGame);

router.get('/tables/:id', protect, async (req, res) => {
  try {
    const table = await PokerTable.findById(req.params.id).populate('players.user', 'username');
    if (!table) return res.status(404).json({ message: req.t('invalid_table') });
    res.status(200).json(table);
  } catch (err) {
    res.status(500).json({ message: req.t('server_error') });
  }
});

module.exports = router;