import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/config';
import { toRemoteLocale, type AppLocale } from '@/shared/i18n';

type RemotePageProps = {
  theme: ShellTheme;
  locale: AppLocale;
  onRetry: () => void;
};

export function RemotePage({ theme, locale, onRetry }: RemotePageProps) {
  return (
    <RemoteSlot
      basename="/remote"
      remoteId="remote"
      theme={theme}
      locale={toRemoteLocale(locale)}
      onRetry={onRetry}
    />
  );
}
