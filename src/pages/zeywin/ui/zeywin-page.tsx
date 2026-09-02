import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/config';
import { toRemoteLocale, type AppLocale } from '@/shared/i18n';

type ZeywinPageProps = {
  theme: ShellTheme;
  locale: AppLocale;
  onRetry: () => void;
};

export function ZeywinPage({ theme, locale, onRetry }: ZeywinPageProps) {
  return (
    <RemoteSlot
      basename="/zeywin"
      remoteId="zeywin"
      theme={theme}
      locale={toRemoteLocale(locale)}
      onRetry={onRetry}
    />
  );
}
