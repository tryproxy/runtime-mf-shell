export type AppLocale = 'en' | 'ru';

export const APP_LOCALES: readonly AppLocale[] = ['en', 'ru'];

export function isAppLocale(
  value: string | null | undefined
): value is AppLocale {
  return value === 'en' || value === 'ru';
}
