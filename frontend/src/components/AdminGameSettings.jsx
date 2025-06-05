import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminGameSettings = () => {
  const { t } = useTranslation();
  const [games, setGames] = useState([
    { name: 'roulette', botWinProbability: 0.6, enabled: true },
    { name: 'poker', 'blackjack', 'dice', 'slots' },
    // Другие игры
  ]);

  const updateSettings = async (index) => {
    try {
      await axios.put('/api/admin/game-settings', {
        game: games[index].name,
        settings: { botWinProbability: games[index].botWinProbability, enabled: games[index].enabled },
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(t('game_settings_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 card">
      <h2 className="text-2xl mb-4">{t('game_settings')}</h2>
      {games.map((game, index) => (
        <div key={game.name} className="mb-4">
          <h3 className="text-lg">{t(game.name)}</h3>
          <label className="block mb-1">
            {t('enabled')}:
            <input
              type="checkbox"
              checked={game.enabled}
              onChange={(e) => {
                const updatedGames = [...games];
                updatedGames[index].enabled = e.target.checked;
                setGames(updatedGames);
              }}
              className="ml-2"
            />
          </label>
          {game.name === 'roulette' && (
            <label className="block mb-1">
              {t('bot_win_probability')}:
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={game.botWinProbability}
                onChange={(e) => {
                  const updatedGames = [...games];
                  updatedGames[index].botWinProbability = Number(e.target.value);
                  setGames(updatedGames);
                }}
                className="ml-2 p-1 bg-[var(--primary-dark)] text-white rounded"
              />
            </label>
          )}
          <button onClick={() => updateSettings(index)} className="admin-btn mt-2">{t('save')}</button>
        </div>
      ))}
    </div>
  );
};

export default AdminGameSettings;