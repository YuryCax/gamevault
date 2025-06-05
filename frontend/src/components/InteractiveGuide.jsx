import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const InteractiveGuide = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [guidesEnabled, setGuidesEnabled] = useState(true);

  const guideSteps = [
    { element: '.navbar', text: t('guide.navbar'), position: 'bottom' },
    { element: '.sidebar', text: t('guide.sidebar'), position: 'right' },
    { element: '.btn-primary', text: t('guide.game_select'), position: 'top' },
  ];

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/user/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGuidesEnabled(res.data.interactiveGuides);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleGuides = async () => {
    try {
      await axios.put('/api/user/settings', { interactiveGuides: !guidesEnabled }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGuidesEnabled(!guidesEnabled);
    } catch (err) {
      console.error(err);
    }
  };

  if (!guidesEnabled || step >= guideSteps.length) return null;

  const currentStep = guideSteps[step];
  const element = document.querySelector(currentStep.element);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const style = {
    position: 'absolute',
    background: '#1E2A44',
    color: 'white',
    padding: '10px',
    borderRadius: '8px',
    zIndex: 1000,
    [currentStep.position]: rect[currentStep.position] + (currentStep.position === 'top' ? -50 : 10),
    left: currentStep.position === 'right' ? rect.right + 10 : rect.left,
  };

  return (
    <div>
      <div style={style}>
        <p>{currentStep.text}</p>
        <button
          onClick={() => setStep(step + 1)}
          className="bg-[var(--accent-green)] text-black p-2 rounded mt-2"
        >
          {t('next')}
        </button>
        <button
          onClick={toggleGuides}
          className="bg-red-500 text-white p-2 rounded mt-2 ml-2"
        >
          {t('disable_guides')}
        </button>
      </div>
      <div
        style={{
          position: 'absolute',
          top: rect.top - 2,
          left: rect.left - 2,
          width: rect.width + 4,
          height: rect.height + 4,
          border: '2px solid #39FF14',
          zIndex: 999,
        }}
      />
    </div>
  );
};

export default InteractiveGuide;