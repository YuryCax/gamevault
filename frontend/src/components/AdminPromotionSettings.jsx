import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminPromotionSettings = () => {
  const { t } = useTranslation();
  const [promotion, setPromotion] = useState({
    type: 'deposit_bonus',
    name: '',
    enabled: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    settings: {
      bonusPercentage: 100,
      minDeposit: 50,
      cashbackPercentage: 10,
      referralBonus: 20,
      lotteryFrequency: 'weekly',
      prizePool: 1000,
      ticketThreshold: 100,
    },
  });

  const createPromotion = async () => {
    try {
      await axios.post('/api/admin/promotions', promotion, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert(t('promotion_created'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{t('manage_promotions')}</h2>
      <label className="block mb-2">
        {t('type')}:
        <select
          value={promotion.type}
          onChange={(e) => setPromotion({ ...promotion, type: e.target.value })}
          className="ml-2 p-1 bg-gray-700 rounded"
        >
          <option value="deposit_bonus">{t('deposit_bonus')}</option>
          <option value="cashback">{t('cashback')}</option>
          <option value="referral">{t('referral')}</option>
          <option value="lottery">{t('lottery')}</option>
        </select>
      </label>
      <label className="block mb-2">
        {t('name')}:
        <input
          type="text"
          value={promotion.name}
          onChange={(e) => setPromotion({ ...promotion, name: e.target.value })}
          className="ml-2 p-1 bg-gray-700 rounded"
        />
      </label>
      <label className="block mb-2">
        {t('enabled')}:
        <input
          type="checkbox"
          checked={promotion.enabled}
          onChange={(e) => setPromotion({ ...promotion, enabled: e.target.checked })}
          className="ml-2"
        />
      </label>
      <label className="block mb-2">
        {t('start_date')}:
        <input
          type="date"
          value={promotion.startDate}
          onChange={(e) => setPromotion({ ...promotion, startDate: e.target.value })}
          className="ml-2 p-1 bg-gray-700 rounded"
        />
      </label>
      <label className="block mb-2">
        {t('end_date')}:
        <input
          type="date"
          value={promotion.endDate}
          onChange={(e) => setPromotion({ ...promotion, endDate: e.target.value })}
          className="ml-2 p-1 bg-gray-700 rounded"
        />
      </label>
      {promotion.type === 'deposit_bonus' && (
        <>
          <label className="block mb-2">
            {t('bonus_percentage')}:
            <input
              type="number"
              value={promotion.settings.bonusPercentage}
              onChange={(e) =>
                setPromotion({
                  ...promotion,
                  settings: { ...promotion.settings, bonusPercentage: Number(e.target.value) },
                })
              }
              className="ml-2 p-1 bg-gray-700 rounded"
            />
          </label>
          <label className="block mb-2">
            {t('min_deposit')}:
            <input
              type="number"
              value={promotion.settings.minDeposit}
              onChange={(e) =>
                setPromotion({
                  ...promotion,
                  settings: { ...promotion.settings, minDeposit: Number(e.target.value) },
                })
              }
              className="ml-2 p-1 bg-gray-700 rounded"
            />
          </label>
        </>
      )}
      {promotion.type === 'lottery' && (
        <>
          <label className="block mb-2">
            {t('lottery_frequency')}:
            <select
              value={promotion.settings.lotteryFrequency}
              onChange={(e) =>
                setPromotion({
                  ...promotion,
                  settings: { ...promotion.settings, lotteryFrequency: e.target.value },
                })
              }
              className="ml-2 p-1 bg-gray-700 rounded"
            >
              <option value="daily">{t('daily')}</option>
              <option value="weekly">{t('weekly')}</option>
              <option value="monthly">{t('monthly')}</option>
            </select>
          </label>
          <label className="block mb-2">
            {t('prize_pool')}:
            <input
              type="number"
              value={promotion.settings.prizePool}
              onChange={(e) =>
                setPromotion({
                  ...promotion,
                  settings: { ...promotion.settings, prizePool: Number(e.target.value) },
                })
              }
              className="ml-2 p-1 bg-gray-700 rounded"
            />
          </label>
          <label className="block mb-2">
            {t('ticket_threshold')}:
            <input
              type="number"
              value={promotion.settings.ticketThreshold}
              onChange={(e) =>
                setPromotion({
                  ...promotion,
                  settings: { ...promotion.settings, ticketThreshold: Number(e.target.value) },
                })
              }
              className="ml-2 p-1 bg-gray-700 rounded"
            />
          </label>
        </>
      )}
      <button
        onClick={createPromotion}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {t('create_promotion')}
      </button>
    </div>
  );
};

export default AdminPromotionSettings;