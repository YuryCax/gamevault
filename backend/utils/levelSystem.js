const User = require('../models/User');

const XP_PER_LEVEL = 1000;

async function addXP(userId, xp) {
  try {
    const user = await User.findById(userId);
    user.xp += xp;
    const newLevel = Math.floor(user.xp / XP_PER_LEVEL);
    if (newLevel > user.level) {
      user.level = newLevel;
      // Optionally: Add rewards for leveling up
    }
    await user.save();
    return user;
  } catch (err) {
    console.error(`Error adding XP: ${err.message}`);
    throw err;
  }
}

module.exports = { addXP };