import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';

const Roulette = () => {
  const { t } = useTranslation();
  const [tableId, setTableId] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [betType, setBetType] = useState('color');
  const [result, setResult] = useState(null);
  const [payout, setPayout] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [players, setPlayers] = useState([]);

  const handleBet = async () => {
    try {
      const res = await axios.post('/api/roulette/start', { tableId, betAmount, betType }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTableId(res.data.table._id);
      setResult(res.data.result);
      setPayout(res.data.payout);
      setBalance(res.data.balance);
      setPlayers(res.data.table.players);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 card"
    >
      <h2 className="text-2xl mb-4">{t('roulette')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">
            {t('bet_amount')}:
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="ml-2 p-1 bg-[var(--primary-dark)] text-white rounded"
            />
          </label>
          <label className="block mb-2">
            {t('bet_type')}:
            <select
              value={betType}
              onChange={(e) => setBetType(e.target.value)}
              className="ml-2 p-1 bg-[var(--primary-dark)] text-white rounded"
            >
              <option value="number">Number</option>
              <option value="color">Color (Red/Black)</option>
            </select>
          </label>
          <button onClick={handleBet} className="btn-primary mt-2">{t('place_bet')}</button>
        </div>
        <div>
          <h3 className="text-lg mb-2">{t('table_status')}</h3>
          <p>{t('players')}: {players.length}/{players_max}</p>
          <p>{t('result')}: {result !== null ? result : '-'}</p>
          <p>{t('payout')}: ${payout.toFixed(2)}</p>
          <p>{t('balance')}: ${balance.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Roulette;