import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Deposit = () => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(0.001);
  const [currency, setCurrency] = useState('BTC');

  const handleDeposit = async () => {
    try {
      const res = await axios.post('/api/payment/crypto', { amount, currency }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      window.location.href = res.data.chargeUrl;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 card">
      <h2 className="text-2xl mb-4">{t('deposit')}</h2>
      <label className="block mb-2">
        {t('amount')}:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="ml-2 p-1 bg-[var(--primary-dark)] text-white rounded"
        />
      </label>
      <label className="block mb-2">
        {t('currency')}:
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="ml-2 p-1 bg-[var(--primary-dark)] text-white rounded"
        >
          <option value="BTC">Bitcoin</option>
          <option value="ETH">Ethereum</option>
          <option value="TRX">TRON</option>
          <option value="TON">TON</option>
        </select>
      </label>
      <button onClick={handleDeposit} className="btn-primary mt-4">{t('deposit')}</button>
    </div>
  );
};

export default Deposit;