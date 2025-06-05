const Lottery = require('../models/Lottery');
const User = require('../models/User');
const { logger } = require('../utils/logger');

async function runLotteryDraw() {
  try {
    const lottery = await Lottery.findOne({ status: 'pending', drawDate: { $lte: new Date() } });
    if (!lottery) return;
    const totalTickets = lottery.tickets.reduce((sum, t) => sum + t.count, 0);
    if (totalTickets < 3) {
      lottery.drawDate = new Date(lottery.drawDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Postpone 1 week
      await lottery.save();
      return;
    }
    const ticketPool = [];
    lottery.tickets.forEach(t => {
      for (let i = 0; i < t.count; i++) ticketPool.push(t.user);
    });
    const winners = [];
    for (let i = 0; i < 3 && ticketPool.length > 0; i++) {
      const winnerIndex = Math.floor(Math.random() * ticketPool.length);
      const winnerId = ticketPool.splice(winnerIndex, 1)[0];
      if (!winners.some(w => w.user.toString() === winnerId.toString())) {
        winners.push({ user: winnerId });
      } else {
        i--;
      }
    }
    const prizes = [0.5, 0.3, 0.2].map(p => p * lottery.prizePool);
    for (let i = 0; i < winners.length; i++) {
      winners[i].prize = prizes[i];
      await User.findByIdAndUpdate(winners[i].user, { $inc: { balance: prizes[i] } });
    }
    lottery.winners = winners;
    lottery.status = 'completed';
    await lottery.save();
    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
    nextMonday.setHours(0, 0, 0, 0);
    await Lottery.create({ drawDate: nextMonday });
    logger.info(`Lottery draw completed: ${winners.length} winners`);
  } catch (err) {
    logger.error(`Lottery draw error: ${err.message}`);
  }
}

module.exports = runLotteryDraw;