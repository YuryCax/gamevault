import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import Modal from './Modal';

const RouletteWheel = () => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState(0);
  const [betType, setBetType] = useState('number');
  const [betValue, setBetValue] = useState('');
  const [result, setResult] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleSpin = async () => {
    try {
      const res = await axios.post(
        '/api/roulette/play',
        { betAmount, betType, betValue },
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
        <h2>{t('roulette_tutorial')}</h2>
        <p>{t('roulette_tutorial_content')}</p>
      </Modal>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl mb-4"
      >
        {t('roulette')}
      </motion.h2>
      <motion.div
        animate={result ? { rotate: 360 * 5 + result.result.number * 9.73 } : {}}
        transition={{ duration: 3 }}
        className="w-64 h-64 bg-gray-900 rounded-full mb-4"
      >
        {/* Placeholder для колеса */}
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
          value={betType}
          onChange={(e) => setBetType(e.target.value)}
          className="p-2 bg-gray-900 text-white rounded ml-2"
          aria-label={t('bet_type')}
        >
          <option value="number">{t('number')}</option>
          <option value="color">{t('color')}</option>
          <option value="evenOdd">{t('even_odd')}</option>
          <option value="dozen">{t('dozen')}</option>
          <option value="column">{t('column')}</option>
          <option value="split">{t('split')}</option>
        </select>
        {betType === 'number' && (
          <input
            type="number"
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            placeholder={t('number_0_36')}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            min="0"
            max="36"
            aria-label={t('number_0_36')}
          />
        )}
        {betType === 'color' && (
          <select
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            aria-label={t('color')}
          >
            <option value="red">{t('red')}</option>
            <option value="black">{t('black')}</option>
          </select>
        )}
        {betType === 'evenOdd' && (
          <select
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            aria-label={t('even_odd')}
          >
            <option value="even">{t('even')}</option>
            <option value="odd">{t('odd')}</option>
          </select>
        )}
        {betType === 'dozen' && (
          <select
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            aria-label={t('dozen')}
          >
            <option value="1">{t('dozen_1_12')}</option>
            <option value="2">{t('dozen_13_24')}</option>
            <option value="3">{t('dozen_25_36')}</option>
          </select>
        )}
        {betType === 'column' && (
          <select
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            aria-label={t('column')}
          >
            <option value="1">{t('column_1')}</option>
            <option value="2">{t('column_2')}</option>
            <option value="3">{t('column_3')}</option>
          </select>
        )}
        {betType === 'split' && (
          <input
            type="text"
            value={betValue}
            onChange={(e) => setBetValue(e.target.value)}
            placeholder={t('split_numbers')}
            className="p-2 bg-gray-900 text-white rounded ml-2"
            aria-label={t('split_numbers')}
          />
        )}
        <button
          onClick={handleSpin}
          className="ml-2 bg-gamevault-purple text-white px-4 py-2 rounded"
        >
          {t('spin')}
        </button>
      </div>
      {result && (
        <p>
          {t('result')}: {result.result.number} ({result.result.color}), {t('payout')}: {result.payout} USDT
        </p>
      )}
    </div>
  );
};

export default RouletteWheel;