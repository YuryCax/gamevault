import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminTournamentSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    tournamentsEnabled: true,
    seasonId: '',
    durationDays: 90,
    prizePool: 1000,
  });

  const updateSettings = async () => {
    try {
      await axios.put('/api/admin/tournament-settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(t('tournament_settings_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const startSeason = async () => {
    try {
      await axios.post('/api/tournaments/season/start', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(t('season_started'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{t('manage_tournament_settings')}</h2>
      <label className="block mb-2">
        {t('tournaments_enabled')}:
        <input
          type="checkbox"
          checked={settings.tournamentsEnabled}
          onChange={(e) => setSettings({ ...settings, tournamentsEnabled: e.target.checked })}
          className="ml-2"
        />
      </label>
      <label className="block mb-2">
        {t('season_id')}:
        <input
          type="text"
          value={settings.seasonId}
          onChange={(e) => setSettings({ ...settings, seasonId: e.target.value })}
          className="ml-2 p-1 bg-gray-700 rounded"
        />
      </label>
      <label className="block mb-2">
        {t('duration_days')}:
        <input
          type="number"
          value={settings.durationDays}
          onChange={(e) => setSettings({ ...settings, durationDays: Number(e.target.value) })}
          className="ml-2 p-1 bg-gray-700 rounded"
        />
      </label>
      <label className="block mb-2">
        {t('prize_pool')}:
        <input
          type="number"
          value={settings.prizePool}
          onChange={(e) => setSettings({ ...settings, prizePool: Number(e.target.value) })}
          className="ml-2 p-1 bg-gray-700 rounded"
        />
      </label>
      <button
        onClick={updateSettings}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
      >
        {t('submit')}
      </button>
      <button
        onClick={startSeason}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        {t('start_season')}
      </button>
    </div>
  );
};

export default AdminTournamentSettings;