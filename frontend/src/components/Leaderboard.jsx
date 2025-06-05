import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Leaderboard = () => {
  const { t } = useTranslation();
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    fetchRankings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRankings = async () => {
    try {
      const res = await axios.get('/api/tournaments/leaderboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setRankings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{t('leaderboard')}</h2>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>{t('rank')}</th>
            <th>{t('username')}</th>
            <th>{t('points')}</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((player, idx) => (
            <tr key={player._id}>
              <td>{idx + 1}</td>
              <td>{player.username}</td>
              <td>{player.tournamentPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;