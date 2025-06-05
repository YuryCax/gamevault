import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Profile = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({ interactiveGuides: true, language: 'en' });

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/user/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSettings = async () => {
    try {
      await axios.put('/api/user/settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(t('settings_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 card">
      <h2 className="text-2xl mb-4">{t('profile_settings')}</h2>
      <label className="block mb-2">
        {t('interactive_guides')}:
        <input
          type="checkbox"
          checked={settings.interactiveGuides}
          onChange={(e) => setSettings({ ...settings, interactiveGuides: e.target.checked })}
          className="ml-2"
        />
      </label>
      <label className="block mb-2">
        {t('language')}:
        <select
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          className="ml-2 p-1 bg-[var(--primary-dark)] text-white rounded"
        >
          <option value="en">English</option>
          <option value="ru">Русский</option>
          <option value="uk">Українська</option>
          <option value="hi">हिन्दी</option>
          <option value="zh">中文</option>
          <option value="tg">Тоҷикӣ</option>
          <option value="uz">Oʻzbek</option>
        </select>
      </label>
      <button onClick={updateSettings} className="btn-primary mt-4">{t('save')}</button>
    </div>
  );
};

export default Profile;