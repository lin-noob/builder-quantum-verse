import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import zhTranslations from './locales/zh.json';
import enTranslations from './locales/en.json';

// Configure i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zhTranslations },
      en: { translation: enTranslations },
    },
    lng: 'zh', // Set default language to Chinese
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lng'
    }
  });

export default i18n;