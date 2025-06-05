import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const GameHistory = () => {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get('/api/games/history/games', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setGames(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (loading) return <p>{t('loading')}</p>;

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl mb-4">{t('game_history')}</h2>
      {games.length === 0 ? (
        <p>{t('no_games')}</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>{t('date')}</th>
              <th>{t('game')}</th>
              <th>{t('bet')}</th>
              <th>{t('payout')}</th>
              <th>{t('result')}</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game._id}>
                <td>{new Date(game.createdAt).toLocaleString()}</td>
                <td>{t(game.gameType)}</td>
                <td>{game.betAmount} USDT</td>
                <td>{game.payout} USDT</td>
                <td>{t(game.result)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GameHistory;