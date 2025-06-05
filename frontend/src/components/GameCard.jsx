import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const GameCard = ({ gameType }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`/api/games/settings/${gameType}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, [gameType]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl">{t(gameType)}</h2>
      {settings && (
        <p>RTP: {settings.rtp}% (Volatility: {settings.volatility})</p>
      )}
      <button className="mt-2 bg-gamevault-purple text-white px-4 py-2 rounded">
        {t('play_now')}
      </button>
    </div>
  );
};

export default GameCard;