import type { AppLocale as RemoteAppLocale } from '@platform/runtime-mf-contract';

export type AppLocale = 'en' | 'ru' | 'es';

export const APP_LOCALES: readonly AppLocale[] = ['en', 'ru', 'es'];

export function isAppLocale(
  value: string | null | undefined
): value is AppLocale {
  return value === 'en' || value === 'ru' || value === 'es';
}

/** Spanish shell chrome uses English resources until translations are supplied. */
export function toRemoteLocale(locale: AppLocale): RemoteAppLocale {
  return locale;
}
