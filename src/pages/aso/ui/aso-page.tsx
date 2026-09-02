import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/config';
import { toRemoteLocale, type AppLocale } from '@/shared/i18n';

type AsoPageProps = {
  theme: ShellTheme;
  locale: AppLocale;
  onRetry: () => void;
};

export function AsoPage({ theme, locale, onRetry }: AsoPageProps) {
  return (
    <RemoteSlot
      basename="/aso"
      remoteId="aso"
      theme={theme}
      locale={toRemoteLocale(locale)}
      onRetry={onRetry}
    />
  );
}
