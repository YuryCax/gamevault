import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import Modal from './Modal';

const SlotMachine = () => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState(1);
  const [reels, setReels] = useState([]);
  const [result, setResult] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleSpin = async () => {
    try {
      const res = await axios.post(
        '/api/slots/play',
        { betAmount },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReels(res.data.reels);
      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)}>
        <h2>{t('slots_tutorial')}</h2>
        <p>{t('slots_tutorial_content')}</p>
      </Modal>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl mb-4"
      >
        {t('slots')}
      </motion.h2>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {reels.map((reel, index) => (
          <motion.div
            key={index}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-2 bg-gray-700 text-center rounded"
          >
            {reel.map((symbol, i) => (
              <p key={i}>{symbol}</p>
            ))}
          </motion.div>
        ))}
      </div>
      <div className="mb-4">
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          placeholder={t('bet_amount')}
          className="p-2 bg-gray-900 text-white rounded"
          min="1"
          aria-label={t('bet_amount')}
        />
        <button
          onClick={handleSpin}
          className="ml-2 bg-gamevault-purple text-white px-4 py-2 rounded"
        >
          {t('spin')}
        </button>
      </div>
      {result && (
        <p>
          {t('result')}: {result.resultStatus}, {t('payout')}: {result.payout} USDT
          {result.freeSpins > 0 && `, ${t('free_spins', { count: result.freeSpins })}`}
          {result.bonusGame && `, ${t('bonus_game')}`}
          {result.jackpot > 0 && `, ${t('jackpot', { amount: result.jackpot })}`}
        </p>
      )}
    </div>
  );
};

export default SlotMachine;