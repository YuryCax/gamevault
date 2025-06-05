import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function AdminPromotions() {
  const { t } = useTranslation();
  const [bonuses, setBonuses] = useState([
    { amount: 100, bonusPercentage: 10 },
    { amount: 300, bonusPercentage: 15 },
    { amount: 500, bonusPercentage: 20 },
    { amount: 1000, bonusPercentage: 25 },
  ]);
  const [lottery, setLottery] = useState({ ticketsPer100USDT: 2, ticketPrice: 1 });
  const [referral, setReferral] = useState({ percentage: 5 });

  const handleBonusChange = (index, field, value) => {
    const newBonuses = [...bonuses];
    newBonuses[index][field] = Number(value);
    setBonuses(newBonuses);
  };

  const handleSaveBonuses = () => {
    fetch('http://localhost:5000/api/promotions/admin/bonuses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tiers: bonuses }),
    })
      .then(res => res.json())
      .then(data => alert(data.message))
      .catch(() => alert(t('server_error')));
  };

  const handleLotteryChange = (field, value) => {
    setLottery({ ...lottery, [field]: Number(value) });
  };

  const handleSaveLottery = () => {
    fetch('http://localhost:5000/api/promotions/admin/lottery', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lottery),
    })
      .then(res => res.json())
      .then(data => alert(data.message))
      .catch(() => alert(t('server_error')));
  };

  const handleReferralChange = e => {
    setReferral({ percentage: Number(e.target.value) });
  };

  const handleSaveReferral = () => {
    fetch('http://localhost:5000/api/promotions/admin/referral', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(referral),
    })
      .then(res => res.json())
      .then(data => alert(data.message))
      .catch(() => alert(t('server_error')));
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h2 className="text-2xl mb-4">{t('admin_promotions')}</h2>
      <div className="mb-6">
        <h3 className="text-xl">{t('deposit_bonuses')}</h3>
        {bonuses.map((tier, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="number"
              value={tier.amount}
              onChange={e => handleBonusChange(index, 'amount', e.target.value)}
              placeholder={t('amount')}
              className="p-2 bg-gray-700 rounded mr-2"
            />
            <input
              type="number"
              value={tier.bonusPercentage}
              onChange={e => handleBonusChange(index, 'bonusPercentage', e.target.value)}
              placeholder={t('bonus_percentage')}
              className="p-2 bg-gray-700 rounded mr-2"
            />
          </div>
        ))}
        <button
          onClick={handleSaveBonuses}
          className="py-2 px-4 bg-purple-600 rounded"
        >
          {t('save')}
        </button>
      </div>
      <div className="mb-6">
        <h3 className="text-xl">{t('lottery_settings')}</h3>
        <div className="mb-2">
          <input
            type="number"
            value={lottery.ticketsPer100USDT}
            onChange={e => handleLotteryChange('ticketsPer100USDT', e.target.value)}
            placeholder={t('tickets_per_100')}
            className="p-2 bg-gray-700 rounded mr-2"
          />
          <input
            type="number"
            value={lottery.ticketPrice}
            onChange={e => handleLotteryChange('ticketPrice', e.target.value)}
            placeholder={t('ticket_price')}
            className="p-2 bg-gray-700 rounded mr-2"
          />
        </div>
        <button
          onClick={handleSaveLottery}
          className="py-2 px-4 bg-purple-600 rounded"
        >
          {t('save')}
        </button>
      </div>
      <div>
        <h3 className="text-xl">{t('referral_program')}</h3>
        <input
          type="number"
          value={referral.percentage}
          onChange={handleReferralChange}
          placeholder={t('referral_percentage')}
          className="p-2 bg-gray-700 rounded mr-2"
        />
        <button
          onClick={handleSaveReferral}
          className="py-2 px-4 bg-purple-600 rounded"
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
}

export default AdminPromotions;