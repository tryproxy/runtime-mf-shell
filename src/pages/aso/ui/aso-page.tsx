import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/config';
import { toRemoteLocale, type AppLocale } from '@/shared/i18n';

type AsoPageProps = {
  theme: ShellTheme;
  locale: AppLocale;
};

export function AsoPage({ theme, locale }: AsoPageProps) {
  return (
    <RemoteSlot
      basename="/aso"
      remoteId="aso"
      theme={theme}
      locale={toRemoteLocale(locale)}
    />
  );
}
