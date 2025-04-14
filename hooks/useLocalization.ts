// app/localization/useLocalization.ts

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from '../app/localization/i18next';
// Define return type
type UseLocalizationReturn = {
  t: (key: string) => string;
  lang: string;
  setLang: (languageCode: string) => Promise<void>;
};

const LANGUAGE_KEY = 'appLanguage';

export const useLocalization = (): UseLocalizationReturn => {
  const [lang, setLanguage] = useState(Localization.locale.split('-')[0]);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        const fallbackLang = Localization.locale.split('-')[0] || 'en';
        const initialLang = savedLang || fallbackLang;

        await i18n.changeLanguage(initialLang);
        setLanguage(initialLang);
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []);

  const setLang = useCallback(async (languageCode: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
      await i18n.changeLanguage(languageCode);
      setLanguage(languageCode);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const translation = i18n.t(key, { lng: lang });
      return translation || key;
    },
    [lang]
  );

  return { t, lang, setLang };
};
