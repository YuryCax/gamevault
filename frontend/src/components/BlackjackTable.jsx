import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';

const BlackjackTable = ({ tableId }) => {
  const { t } = useTranslation();
  const [table, setTable] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [action, setAction] = useState('hit');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTable = async () => {
    try {
      const res = await axios.get(`/api/blackjack/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTable(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      const res = await axios.post(
        '/api/blackjack/start',
        { tableId, betAmount, action },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTable(res.data.table);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>{t('loading')}</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-gray-800 text-white rounded-lg"
    >
      <h2 className="text-2xl mb-4">{t('blackjack_table')} #{table.tableNumber}</h2>
      <div className="mb-4">
        <h3>{t('dealer_hand')}:</h3>
        {table.dealerHand.map((card, idx) => (
          <span key={idx} className="mx-1">
            {card.value} {card.suit}
          </span>
        ))}
      </div>
      <div className="mb-4">
        <h3>{t('your_hand')}:</h3>
        {table.players.find(p => p.user._id === localStorage.getItem('userId'))?.hand.map((card, idx) => (
          <span key={idx} className="mx-1">
            {card.value} {card.suit}
          </span>
        ))}
      </div>
      <div className="mb-4">
        <label>{t('bet_amount')}:</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          className="ml-2 p-1 bg-gray-700 rounded"
        />
      </div>
      <div className="mb-4">
        <label>{t('action')}:</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="ml-2 p-1 bg-gray-700 rounded"
        >
          <option value="hit">{t('hit')}</option>
          <option value="stand">{t('stand')}</option>
          <option value="double">{t('double_down')}</option>
          <option value="split">{t('split')}</option>
          <option value="surrender">{t('surrender')}</option>
        </select>
      </div>
      <button
        onClick={handleAction}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {t('submit')}
      </button>
    </motion.div>
  );
};

export default BlackjackTable;