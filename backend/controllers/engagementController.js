const UserEngagement = require('../models/UserEngagement');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { logger } = require('../utils/logger');

const claimDailyBonus = async (req, res) => {
  try {
    const engagement = await UserEngagement.findOne({ user: req.user._id });
    if (!engagement) return res.status(400).json({ message: req.t('no_engagement_data') });

    const now = new Date();
    const lastClaimed = engagement.dailyBonus.lastClaimed;
    if (lastClaimed && now.toDateString() === lastClaimed.toDateString()) {
      return res.status(400).json({ message: req.t('bonus_already_claimed') });
    }

    engagement.dailyBonus.streak = lastClaimed && (now - lastClaimed) / (1000 * 60 * 60 * 24) < 2 ? engagement.dailyBonus.streak + 1 : 1;
    engagement.dailyBonus.lastClaimed = now;
    const bonus = engagement.dailyBonus.bonusAmount * (engagement.dailyBonus.streak >= 7 ? 2 : 1);
    await engagement.save();

    const user = await User.findById(req.user._id);
    user.balance += bonus;
    await user.save();
    await new Transaction({ user: req.user._id, type: 'daily_bonus', amount: bonus }).save();

    res.status(200).json({ message: req.t('bonus_claimed', { amount: bonus }) });
  } catch (err) {
    logger.error(`Daily bonus error: ${err.message}`);
    res.status(500).json({ message: req.t('server_error') });
  }
};

const updateMissionProgress = async (userId, missionName, progress) => {
  try {
    const engagement = await UserEngagement.findOne({ user: req.user._id });
    const mission = engagement.missions.find(m => m.name === missionName);
    if (!mission || mission.completed) return;

    mission.progress += progress;
    if (mission.progress >= mission.target) {
      mission.completed = true;
      const user = await User.findById(userId);
      user.balance += mission.reward;
      await user.save();
      await new Transaction({ user: userId, type: 'mission_reward', amount: mission.reward }).save();
    }
    await engagement.save();
  } catch (err) {
    logger.error(`Mission update error: ${err.message}`);
  }
};

const unlockAchievement = async (userId, achievementName) => {
  try {
    const engagement = await UserEngagement.findOne({ user: userId });
    const achievement = engagement.achievements.find(a => a.name === achievementName);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    const user = await User.findById(userId);
    user.balance += achievement.reward;
    await user.save();
    await new Transaction({ user: userId, type: 'achievement_reward', amount: achievement.reward }).save();
    await engagement.save();
  } catch (err) {
    logger.error(`Achievement unlock error: ${err.message}`);
  }
};

module.exports = { claimDailyBonus, updateMissionProgress, unlockAchievement };