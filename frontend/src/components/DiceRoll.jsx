import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import Modal from './Modal';

const DiceRoll = () => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState(0);
  const [betMode, setBetMode] = useState('exact');
  const [betValue, setBetValue] = useState('');
  const [result, setResult] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleRoll = async () => {
    try {
      const res = await axios.post(
        '/api/dice/play',
        { betAmount, betMode, betValue },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)}>
        <h2>{t('dice_tutorial')}</h2>
        <p>{t('dice_tutorial_content')}</p>
      </Modal>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl mb-4"
      >
        {t('dice')}
      </motion.h2>
      <motion.div
        animate={result ? { rotate: 360, y: [0, -50, 0] } : {}}
        transition={{ duration: 1 }}
        className="flex space-x-4 mb-4"
      >
        {result && result.roll.map((die, i) => (
          <div key={i} className="w-16 h-16 bg-white text-black flex items-center justify-center rounded">
            {die}
          </div>
        ))}
      </motion.div>
      <div className="mb-4">
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder={t('bet_amount')}
          className="p-2 bg-gray-900 text-white rounded"
          aria-label={t('bet_amount')}
        />
        <select
          value={betMode}
          onChange={(e) => setBetMode(e.target.value)}
          className="p-2 bg-gray-900 text-white rounded ml-2"
          aria-label={t('bet_mode')}
        >
          <option value="exact">{t('exact_number')}</option>
          <option value="overUnder">{t('over_under')}</option>
          <option value="pair">{t('pair')}</option>
          <option value="sum7or11">{t('sum_7_11')}</option>
        </select>
        {betMode === 'exact' && (
          <input
            type="number"
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            placeholder={t('2_12')}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            min="2"
            max="12"
            aria-label={t('2_12')}
          />
        )}
        {betMode === 'overUnder' && (
          <select
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            aria-label={t('over_under')}
          >
            <option value="over">{t('over_6')}</option>
            <option value="under">{t('under_6')}</option>
          </select>
        )}
        {betMode === 'pair' && (
          <input
            type="text"
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            placeholder={t('pair_value')}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            aria-label={t('pair_value')}
          />
        )}
        {betMode === 'sum7or11' && (
          <input
            type="text"
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            placeholder={t('sum_7_11_value')}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            aria-label={t('sum_7_11_value')}
          />
        )}
        <button
          onClick={handleRoll}
          className="ml-2 bg-gamevault-purple text-white px-4 py-2 rounded"
        >
          {t('roll')}
        </button>
      </div>
      {result && (
        <p>
          {t('result')}: {result.roll.join(' + ')} = {result.sum}, {t('payout')}: {result.payout} USDT
          {result.bonusRound && `, ${t('bonus_round')}`}
        </p>
      )}
    </div>
  );
};

export default DiceRoll;