import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import AdminGameSettings from './AdminGameSettings';
import AdminTournamentSettings from './AdminTournamentSettings';
import AdminPromotionSettings from './AdminPromotionSettings';
import AdminEngagementSettings from './AdminEngagementSettings';
import AdminPaymentSettings from './AdminPaymentSettings';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminPanel = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalBalance: 0,
    casinoBalance: { commission: 0, botWins: 0, casinoWins: 0, total: 0 },
    userTotalBalance: 0,
    tables: { poker: 0, blackjack: 0, roulette: 0 },
    players: { dice: 0, slots: 0 },
  });

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = {
    labels: [t('poker'), t('blackjack'), t('roulette'), t('dice'), t('slots')],
    datasets: [{
      data: [300, 200, 150, 100, 250],
      backgroundColor: ['#F6AD55', '#39FF14', '#FF6384', '#36A2EB', '#FFCE56'],
    }],
  };

  return (
    <div className="admin-panel p-4 rounded-lg">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-4">{t('admin_panel')}</h1>
        <nav className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`admin-btn ${activeTab === 'dashboard' ? 'bg-[var(--admin-accent)]' : ''}`}
          >
            {t('dashboard')}
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`admin-btn ${activeTab === 'games' ? 'bg-[var(--admin-accent)]' : ''}`}
          >
            {t('games')}
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`admin-btn ${activeTab === 'tournaments' ? 'bg-[var(--admin-accent)]' : ''}`}
          >
            {t('tournaments')}
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`admin-btn ${activeTab === 'promotions' ? 'bg-[var(--admin-accent)]' : ''}`}
          >
            {t('promotions')}
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`admin-btn ${activeTab === 'engagement' ? 'bg-[var(--admin-accent)]' : ''}`}
          >
            {t('engagement')}
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`admin-btn ${activeTab === 'payments' ? 'bg-[var(--admin-accent)]' : ''}`}
          >
            {t('payment_settings')}
          </button>
        </nav>
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <h2 className="text-xl mb-2">{t('game_popularity')}</h2>
              <Doughnut data={chartData} />
            </div>
            <div className="card">
              <h2 className="text-xl mb-2">{t('financial_stats')}</h2>
              <p>{t('total_balance')}: ${stats.totalBalance.toFixed(2)}</p>
              <p>{t('casino_balance')}: ${stats.casinoBalance.total.toFixed(2)}</p>
              <ul className="ml-4">
                <li>{t('commission')}: ${stats.casinoBalance.commission.toFixed(2)}</li>
                <li>{t('bot_wins')}: ${stats.casinoBalance.botWins.toFixed(2)}</li>
                <li>{t('casino_wins')}: ${stats.casinoBalance.casinoWins.toFixed(2)}</li>
              </ul>
              <p>{t('user_balance')}: ${stats.userTotalBalance.toFixed(2)}</p>
            </div>
            <div className="card">
              <h2 className="text-xl mb-2">{t('table_stats')}</h2>
              <p>{t('poker_tables')}: {stats.tables.poker}</p>
              <p>{t('blackjack_tables')}: {stats.tables.blackjack}</p>
              <p>{t('roulette_tables')}: {stats.tables.roulette}</p>
            </div>
            <div className="card">
              <h2 className="text-xl mb-2">{t('player_stats')}</h2>
              <p>{t('dice_players')}: {stats.players.dice}</p>
              <p>{t('slots_players')}: {stats.players.slots}</p>
            </div>
          </div>
        )}
        {activeTab === 'games' && <AdminGameSettings />}
        {activeTab === 'tournaments' && <AdminTournamentSettings />}
        {activeTab === 'promotions' && <AdminPromotionSettings />}
        {activeTab === 'engagement' && <AdminEngagementSettings />}
        {activeTab === 'payments' && <AdminPaymentSettings />}
      </motion.div>
    </div>
  );
};

export default AdminPanel;