import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';
import tg from './locales/tg.json';
import uz from './locales/uz.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    uk: { translation: uk },
    hi: { translation: hi },
    zh: { translation: zh },
    tg: { translation: tg },
    uz: { translation: uz },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;