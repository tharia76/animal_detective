// app/localization/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { strings } from './strings';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      en: { translation: strings.en },
      ru: { translation: strings.ru },
      tr: { translation: strings.tr },
      es: { translation: strings.es },
      pt: { translation: strings.pt },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    // Add debug flag for development if helpful
    // debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
