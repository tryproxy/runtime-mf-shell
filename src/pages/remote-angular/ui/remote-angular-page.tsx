import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/config';
import { toRemoteLocale, type AppLocale } from '@/shared/i18n';

type RemoteAngularPageProps = {
  theme: ShellTheme;
  locale: AppLocale;
  onRetry: () => void;
};

export function RemoteAngularPage({
  theme,
  locale,
  onRetry,
}: RemoteAngularPageProps) {
  return (
    <RemoteSlot
      basename="/remote-angular"
      remoteId="remoteAngular"
      theme={theme}
      locale={toRemoteLocale(locale)}
      onRetry={onRetry}
    />
  );
}
