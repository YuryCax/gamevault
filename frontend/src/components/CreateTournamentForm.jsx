import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function CreateTournamentForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    description: '',
    gameType: 'poker',
    entryFee: 0,
    maxPlayers: 0,
    startDate: '',
    endDate: '',
    prizes: '',
    rebuyLimit: 2,
    knockoutBounty: 0,
    initialPoints: 1000,
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const prizes = form.prizes.split(',').map(Number);
      if (prizes.reduce((a, b) => a + b, 0) !== 100) {
        alert(t('invalid_prizes'));
        return;
      }
      const response = await fetch('http://localhost:5000/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1')}`,
        },
        body: JSON.stringify({ ...form, prizes }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(t('create_tournament_success'));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert(t('tournament_creation_error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800/50 rounded-lg">
      <h3 className="text-xl mb-4">{t('create_tournament')}</h3>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder={t('tournament_name')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder={t('description')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <select
        name="gameType"
        value={form.gameType}
        onChange={handleChange}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      >
        <option value="poker">{t('poker')}</option>
        <option value="slots">{t('slots')}</option>
        <option value="roulette">{t('roulette')}</option>
        <option value="dice">{t('dice')}</option>
      </select>
      <input
        type="number"
        name="entryFee"
        value={form.entryFee}
        onChange={handleChange}
        placeholder={t('entry_fee')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <input
        type="number"
        name="maxPlayers"
        value={form.maxPlayers}
        onChange={handleChange}
        placeholder={t('max_players')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <input
        type="datetime-local"
        name="startDate"
        value={form.startDate}
        onChange={handleChange}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <input
        type="datetime-local"
        name="endDate"
        value={form.endDate}
        onChange={handleChange}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <input
        type="text"
        name="prizes"
        value={form.prizes}
        onChange={handleChange}
        placeholder={t('prizes')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <input
        type="number"
        name="rebuyLimit"
        value={form.rebuyLimit}
        onChange={handleChange}
        placeholder={t('rebuy_limit')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <input
        type="number"
        name="knockoutBounty"
        value={form.knockoutBounty}
        onChange={handleChange}
        placeholder={t('knockout_bounty')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <input
        type="number"
        name="initialPoints"
        value={form.initialPoints}
        onChange={handleChange}
        placeholder={t('initial_points')}
        className="w-full p-2 mb-2 bg-gray-700 rounded"
      />
      <button type="submit" className="w-full py-2 bg-purple-600 rounded">{t('create')}</button>
    </form>
  );
}

export default CreateTournamentForm;