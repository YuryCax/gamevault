const express = require('express');
const router = express.Router();
const { joinTournament, startSeason } = require('../controllers/tournamentController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/join', protect, joinTournament);
router.post('/season/start', protect, isAdmin, startSeason);

module.exports = router;