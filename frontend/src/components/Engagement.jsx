import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Engagement = () => {
  const { t } = useTranslation();
  const [engagement, setEngagement] = useState(null);

  useEffect(() => {
    fetchEngagement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEngagement = async () => {
    try {
      const res = await axios.get('/api/engagement', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEngagement(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const claimBonus = async () => {
    try {
      const res = await axios.post('/api/engagement/daily-bonus', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(res.data.message);
      fetchEngagement();
    } catch (err) {
      console.error(err);
    }
  };

  if (!engagement) return <div>{t('loading')}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{t('engagement')}</h2>
      <div className="mb-4">
        <h3>{t('daily_bonus')}</h3>
        <p>{t('streak')}: {engagement.dailyBonus.streak}</p>
        <button
          onClick={claimBonus}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {t('claim_bonus')}
        </button>
      </div>
      <div className="mb-4">
        <h3>{t('missions')}</h3>
        {engagement.missions.map((mission) => (
          <div key={mission.name} className="mb-2">
            <p>{mission.description}</p>
            <p>
              {t('progress')}: {mission.progress}/{mission.target}
            </p>
            <p>{t('reward')}: {mission.reward} USDT</p>
          </div>
        ))}
      </div>
      <div>
        <h3>{t('achievements')}</h3>
        {engagement.achievements.map((achievement) => (
          <div key={achievement.name} className="mb-2">
            <p>{achievement.description}</p>
            <p>{achievement.unlocked ? t('unlocked') : t('locked')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Engagement;