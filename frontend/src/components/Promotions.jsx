import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Promotions = () => {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await axios.get('/api/promotions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPromotions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const applyPromotion = async (promotionId) => {
    try {
      await axios.post(
        '/api/promotions/apply',
        { promotionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert(t('promotion_applied'));
      fetchPromotions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{t('promotions')}</h2>
      {promotions.map((promo) => (
        <div key={promo._id} className="mb-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl">{promo.name}</h3>
          <p>{t(promo.type)}</p>
          <p>
            {t('valid_until')}: {new Date(promo.endDate).toLocaleDateString()}
          </p>
          <button
            onClick={() => applyPromotion(promo._id)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={promo.participants.includes(localStorage.getItem('userId'))}
          >
            {t('apply')}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Promotions;