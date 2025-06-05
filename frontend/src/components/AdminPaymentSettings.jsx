import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminPaymentSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    cryptoEnabled: false,
    supportedCurrencies: [
      { currency: 'BTC', enabled: true },
      { currency: 'ETH', enabled: true },
      { currency: 'TRX', enabled: true },
      { currency: 'TON', enabled: true },
    ],
    coinbaseApiKey: '',
  });

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/admin/payment-settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSettings = async () => {
    try {
      await axios.put('/api/admin/payment-settings', settings, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(t('payment_settings_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 card">
      <h2 className="text-2xl mb-4">{t('payment_settings')}</h2>
      <label className="block mb-2">
        {t('crypto_enabled')}:
        <input
          type="checkbox"
          checked={settings.cryptoEnabled}
          onChange={(e) => setSettings({ ...settings, cryptoEnabled: e.target.checked })}
          className="ml-2"
        />
      </label>
      {settings.supportedCurrencies.map((crypto, index) => (
        <label key={crypto.currency} className="block mb-2">
          {t(crypto.currency)}:
          <input
            type="checkbox"
            checked={crypto.enabled}
            onChange={(e) => {
              const updatedCurrencies = [...settings.supportedCurrencies];
              updatedCurrencies[index].enabled = e.target.checked;
              setSettings({ ...settings, supportedCurrencies: updatedCurrencies });
            }}
            className="ml-2"
          />
        </label>
      ))}
      <label className="block mb-2">
        {t('coinbase_api_key')}:
        <input
          type="text"
          value={settings.coinbaseApiKey}
          onChange={(e) => setSettings({ ...settings, coinbaseApiKey: e.target.value })}
          className="ml-2 p-1 bg-[var(--primary-dark)] rounded"
        />
      </label>
      <button onClick={updateSettings} className="admin-btn mt-4">{t('save')}</button>
    </div>
  );
};

export default AdminPaymentSettings;