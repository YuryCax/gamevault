const Tournament = require('../models/Tournament');
const User = require('../models/User');
const { logger } = require('../utils/logger');

const joinTournament = async (req, res) => {
  const { tournamentId } = req.body;
  try {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament || tournament.status !== 'pending') {
      return res.status(400).json({ message: req.t('invalid_tournament') });
    }

    if (tournament.participants.includes(req.user._id)) {
      return res.status(400).json({ message: req.t('already_joined') });
    }

    tournament.participants.push(req.user._id);
    await tournament.save();
    res.status(200).json({ message: req.t('tournament_joined') });
  } catch (err) {
    logger.error(`Join tournament error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

const endTournament = async (tournamentId) => {
  try {
    const tournament = await Tournament.findById(tournamentId).populate('participants');
    if (!tournament || tournament.status !== 'ongoing') return;

    tournament.status = 'finished';
    const rankings = tournament.rankings.sort((a, b) => b.points - a.points);
    for (let i = 0; i < rankings.length; i++) {
      const user = await User.findById(rankings[i].user);
      const points = i < 3 ? 10 : i < 10 ? 5 : 1;
      user.tournamentPoints += points;
      user.seasonHistory.push({
        seasonId: tournament.seasonId,
        points,
        rank: i + 1,
        rewards: i < 3 ? tournament.prizePool * (i === 0 ? 0.5 : i === 1 ? 0.3 : 0.2) : 0,
        endAt: new Date(),
      });
      await user.save();
    }
    await tournament.save();
  } catch (err) {
    logger.error(`End tournament error: ${err.message}`);
  }
};

const startSeason = async (req, res) => {
  const { seasonId, durationDays, prizePool } = req.body;
  try {
    const tournaments = await Tournament.find({ seasonId });
    if (tournaments.length > 0) return res.status(400).json({ message: req.t('season_exists') });

    await Tournament.create({
      name: `Season ${seasonId} Kickoff`,
      gameType: 'poker',
      seasonId,
      prizePool,
      startTime: new Date(),
      endTime: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    });
    res.status(200).json({ message: req.t('season_started') });
  } catch (err) {
    logger.error(`Start season error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

module.exports = { joinTournament, endTournament, startSeason };