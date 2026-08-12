import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { type AppLocale, isAppLocale } from './locale';
import { en } from './locales/en';
import { es } from './locales/es';
import { ru } from './locales/ru';

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
    es: { translation: es },
  },
  lng: typeof window === 'undefined' ? 'en' : readStoredLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export { i18n };
