import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminEngagementSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    dailyBonusEnabled: true,
    missionsEnabled: true,
    achievementsEnabled: true,
    dailyBonusAmount: 10,
    missions: [
      { name: 'play_50_games', description: t('play_50_games'), target: 50, reward: 20 },
    ],
    achievements: [
      { name: 'win_100_games', description: t('win_100_games'), reward: 50 },
    ],
  });

  const updateSettings = async () => {
    try {
      await axios.put('/api/admin/engagement-settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(t('engagement_settings_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{t('manage_engagement_settings')}</h2>
      <label className="block mb-2">
        {t('daily_bonus_enabled')}:
        <input
          type="checkbox"
          checked={settings.dailyBonusEnabled}
          onChange={(e) => setSettings({ ...settings, dailyBonusEnabled: e.target.checked })}
          className="ml-2"
        />
      </label>
      <label className="block mb-2">
        {t('missions_enabled')}:
        <input
          type="checkbox"
          checked={settings.missionsEnabled}
          onChange={(e) => setSettings({ ...settings, missionsEnabled: e.target.checked })}
          className="ml-2"
        />
      </label>
      <label className="block mb-2">
        {t('achievements_enabled')}:
        <input
          type="checkbox"
          checked={settings.achievementsEnabled}
          onChange={(e) => setSettings({ ...settings, achievementsEnabled: e.target.checked })}
          className="ml-2"
        />
      </label>
      <label className="block mb-2">
        {t('daily_bonus_amount')}:
        <input
          type="number"
          value={settings.dailyBonusAmount}
          onChange={(e) => setSettings({ ...settings, dailyBonusAmount: Number(e.target.value) })}
          className="ml-2 p-1 bg-gray-700 rounded"
        />
      </label>
      <button
        onClick={updateSettings}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {t('submit')}
      </button>
    </div>
  );
};

export default AdminEngagementSettings;