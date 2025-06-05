import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function PendingWithdrawals({ t }) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/admin/withdrawals', {
      headers: {
        Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`,
      },
    })
      .then(res => res.json())
      .then(setWithdrawals)
      .catch(() => setError(t('withdrawals_load_error')));
  }, [t]);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/withdraw/${action}/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`,
        },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setWithdrawals(withdrawals.filter(w => w._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <h3>{t('pending_withdrawals')}</h3>
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {withdrawals.map(w => (
          <li key={w._id} className="mb-2">
            <span>{w.userId.username}: {w.amount}$ ({w.network})</span>
            <button
              onClick={() => handleAction(w._id, 'approve')}
              className="ml-2 py-1 px-2 bg-green-600 rounded"
            >
              {t('approve')}
            </button>
            <button
              onClick={() => handleAction(w._id, 'decline')}
              className="ml-2 py-1 px-2 bg-red-600 rounded"
            >
              {t('decline')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PendingWithdrawals;