import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from '../locales/en';
import { ru } from '../locales/ru';
import { type AppLocale, isAppLocale } from '../model/locale';

const STORAGE_KEY = 'shell-locale';

export function readStoredLocale(): AppLocale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isAppLocale(stored) ? stored : 'en';
}

export function persistLocale(locale: AppLocale): void {
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: typeof window === 'undefined' ? 'en' : readStoredLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export { i18n };
