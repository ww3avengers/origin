import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your JSON translations
import translationEn from './en/translation.json';
import translationDe from './de/translation.json';
import landingEn from './en/landing.json';
import landingDe from './de/landing.json';

// Import the types
import type { Resources } from './types';

export const defaultNS = 'translation' as const;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: Resources;
  }
}

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    defaultNS,
    ns: ['translation', 'landing'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      en: {
        translation: translationEn,
        landing: landingEn,
      },
      de: {
        translation: translationDe,
        landing: landingDe,
      },
    },
  });

export default i18n;
