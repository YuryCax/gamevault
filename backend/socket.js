const Filter = require('bad-words');
const Message = require('./models/Message');
const ChatBan = require('./models/ChatBan');
const User = require('./models/User');

const filter = new Filter();

module.exports = function initializeSocket(io) {
  io.on('connection', (socket) => {
    socket.on('joinTournamentChat', async (tournamentId) => {
      socket.join(tournamentId);
      try {
        const messages = await Message.find({ tournament: tournamentId })
          .populate('user', 'username')
          .sort({ createdAt: -1 })
          .limit(50);
        socket.emit('chatHistory', messages.reverse());
      } catch (err) {
        socket.emit('error', { message: 'Failed to load chat history' });
      }
    });

    socket.on('sendMessage', async ({ tournamentId, userId, text }) => {
      try {
        const ban = await ChatBan.findOne({ user: userId, tournament: tournamentId, bannedUntil: { $gt: new Date() } });
        if (ban) {
          return socket.emit('error', { message: `You are banned until ${ban.bannedUntil}` });
        }
        const cleanText = filter.clean(text);
        const message = await Message.create({
          tournament: tournamentId,
          user: userId,
          text: cleanText,
        });
        const populatedMessage = await Message.findById(message._id).populate('user', 'username');
        io.to(tournamentId).emit('newMessage', populatedMessage);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('deleteMessage', async ({ messageId, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized' });
        }
        const message = await Message.findByIdAndDelete(messageId);
        if (message) {
          io.to(message.tournament.toString()).emit('messageDeleted', { messageId });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    socket.on('banUser', async ({ tournamentId, userIdToBan, adminId }) => {
      try {
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
          return socket.emit('error', { message: 'Unauthorized' });
        }
        const bannedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await ChatBan.create({ user: userIdToBan, tournament: tournamentId, bannedUntil });
        io.to(tournamentId).emit('userBanned', { userId: userIdToBan, bannedUntil });
      } catch (err) {
        socket.emit('error', { message: 'Failed to ban user' });
      }
    });
  });
};