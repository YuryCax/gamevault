import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import Modal from './Modal';

const socket = io(process.env.VITE_API_URL);

const PokerTable = ({ tableId }) => {
  const { t } = useTranslation();
  const [table, setTable] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [action, setAction] = useState('check');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const res = await axios.get(`/api/poker/tables/${tableId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTable(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchTable();

    socket.emit('joinRoom', { tableId, userId: localStorage.getItem('userId') });
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off('message');
  }, [tableId]);

  const handleAction = async () => {
    try {
      const res = await axios.post(
        `/api/poker/play`,
        { tableId, betAmount, action },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTable(res.data.table);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      socket.emit('sendMessage', { tableId, userId: localStorage.getItem('userId'), message: chatMessage });
      setChatMessage('');
    }
  };

  if (loading) return <p>{t('loading')}</p>;

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)}>
        <h2>{t('poker_tutorial')}</h2>
        <p>{t('poker_tutorial_content')}</p>
      </Modal>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl mb-4"
      >
        {t('poker_table')} #{table.tableNumber}
      </motion.h2>
      <div className="mb-4">
        <p>{t('pot')}: {table.pot} USDT</p>
        <p>{t('community_cards')}: {table.communityCards.map(c => `${c.value} of ${c.suit}`).join(', ')}</p>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {table.players.map((player, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-2 bg-gray-700 rounded"
          >
            <p>{player.isBot ? t('bot') : player.user.username}</p>
            <p>{t('balance')}: {player.balance} USDT</p>
            <p>{t('bet')}: {player.currentBet} USDT</p>
            <p>{t('status')}: {t(player.status)}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-4">
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder={t('bet_amount')}
          className="p-2 bg-gray-900 text-white rounded"
          aria-label={t('bet_amount')}
        />
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="p-2 bg-gray-900 text-white rounded ml-2"
          aria-label={t('action')}
        >
          <option value="check">{t('check')}</option>
          <option value="call">{t('call')}</option>
          <option value="raise">{t('raise')}</option>
          <option value="fold">{t('fold')}</option>
        </select>
        <button
          onClick={handleAction}
          className="ml-2 bg-gamevault-purple text-white px-4 py-2 rounded"
        >
          {t('submit')}
        </button>
      </div>
      <div className="mt-4">
        <h3>{t('chat')}</h3>
        <div className="h-40 overflow-y-auto bg-gray-900 p-2 rounded">
          {messages.map((msg, i) => (
            <p key={i}>{msg.userId}: {msg.message}</p>
          ))}
        </div>
        <input
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder={t('type_message')}
          className="p-2 bg-gray-900 text-white rounded w-full mt-2"
          aria-label={t('chat_input')}
        />
        <button
          onClick={sendMessage}
          className="mt-2 bg-gamevault-purple text-white px-4 py-2 rounded"
        >
          {t('send')}
        </button>
      </div>
    </div>
  );
};

export default PokerTable;