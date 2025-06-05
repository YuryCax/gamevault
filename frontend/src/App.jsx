import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import BlackjackTable from './components/BlackjackTable';
import PokerTable from './components/PokerTable';
import Roulette from './components/Roulette';
import Dice from './components/Dice';
import Slots from './components/Slots';
import Leaderboard from './components/Leaderboard';
import Promotions from './components/Promotions';
import Engagement from './components/Engagement';
import AdminPanel from './components/AdminPanel';

const App = () => {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('light', theme === 'dark');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[var(--bg-dark)]' : 'bg-white'}`}>
      <nav className="navbar">
        <div className="flex space-x-4">
          <Link to="/" className="text-xl font-bold">{t('gamevault')}</Link>
          <Link to="/blackjack" className="btn-primary">{t('blackjack')}</Link>
          <Link to="/poker" className="btn-primary">{t('poker')}</Link>
          <Link to="/roulette" className="btn-primary">{t('roulette')}</Link>
          <Link to="/dice" className="btn-primary">{t('dice')}</Link>
          <Link to="/slots" className="btn-primary">{t('slots')}</Link>
          <Link to="/leaderboard" className="btn-primary">{t('leaderboard')}</Link>
          <Link to="/promotions" className="btn-primary">{t('promotions')}</Link>
          <Link to="/engagement" className="btn-primary">{t('engagement')}</Link>
        </div>
        <div className="flex items-center space-x-4">
          <select
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-[var(--primary-dark)] text-white p-2 rounded"
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="uk">Українська</option>
            <option value="hi">हिन्दी</option>
            <option value="zh">中文</option>
            <option value="tg">Тоҷикӣ</option>
            <option value="uz">Oʻzbek</option>
          </select>
          <button onClick={toggleTheme} className="btn-primary">
            {theme === 'dark' ? t('light_theme') : t('dark_theme')}
          </button>
        </div>
      </nav>
      <div className="flex">
        <aside className="sidebar">
          <ul className="space-y-4">
            <li><Link to="/profile" className="text-white hover:text-[var(--accent-green)]">{t('profile')}</Link></li>
            <li><Link to="/admin" className="text-white hover:text-[var(--accent-green)]">{t('admin')}</Link></li>
          </ul>
        </aside>
        <main className="flex-1 p-8 ml-64">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Routes>
              <Route path="/blackjack" element={<BlackjackTable />} />
              <Route path="/poker" element={<PokerTable />} />
              <Route path="/roulette" element={<Roulette />} />
              <Route path="/dice" element={<Dice />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/engagement" element={<Engagement />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default App;