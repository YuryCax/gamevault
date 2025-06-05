const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const ChatBan = require('../models/ChatBan');

router.get('/', protect, tournamentController.getAllTournaments);
router.get('/me', protect, tournamentController.getMyTournaments);
router.post('/:id/join', protect, tournamentController.joinTournament);
router.post('/:id/score', protect, tournamentController.addScore);
router.post('/:id/finish', protect, tournamentController.finishTournament);
router.get('/:id/messages', protect, tournamentController.getMessages);
router.post('/:id/messages', protect, tournamentController.sendMessage);
router.post('/:id/ban', protect, tournamentController.banUser);

module.exports = router;