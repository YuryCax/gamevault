import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function TournamentChat({ t, tournamentId }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    socket.emit('joinTournamentChat', tournamentId);
    socket.on('chatHistory', (history) => setMessages(history));
    socket.on('newMessage', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('messageDeleted', ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    socket.on('userBanned', ({ userId, bannedUntil }) => {
      if (user?._id === userId) {
        alert(t('banned_until', { date: new Date(bannedUntil).toLocaleString() }));
      }
    });
    socket.on('error', (err) => alert(err.message));

    fetch('http://localhost:5000/auth/me', {
      headers: {
        Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => alert(t('auth_error')));

    return () => {
      socket.off('chatHistory');
      socket.off('newMessage');
      socket.off('messageDeleted');
      socket.off('userBanned');
      socket.off('error');
    };
  }, [t, tournamentId]);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit('sendMessage', { tournamentId, userId: user._id, text: message });
      setMessage('');
    }
  };

  const handleDelete = (messageId) => {
    socket.emit('deleteMessage', { messageId, userId: user._id });
  };

  const handleBan = (userIdToBan) => {
    socket.emit('banUser', { tournamentId, userIdToBan, adminId: user._id });
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <h3>{t('tournament_chat')}</h3>
      <div className="h-64 overflow-y-auto mb-2">
        {messages.map((msg) => (
          <div key={msg._id} className="flex justify-between">
            <p>
              <strong>{msg.user.username}</strong> ({new Date(msg.createdAt).toLocaleTimeString()}): {msg.text}
            </p>
            {user?.role === 'admin' && (
              <div>
                <button
                  onClick={() => handleDelete(msg._id)}
                  className="ml-2 py-1 px-2 bg-red-600 rounded"
                >
                  {t('delete')}
                </button>
                <button
                  onClick={() => handleBan(msg.user._id)}
                  className="ml-2 py-1 px-2 bg-yellow-600 rounded"
                >
                  {t('ban')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('type_message')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <button onClick={handleSend} className="w-full py-2 bg-purple-600 rounded">{t('send')}</button>
    </div>
  );
}

export default TournamentChat;