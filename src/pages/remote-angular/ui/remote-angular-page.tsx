import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/config';
import type { AppLocale } from '@/shared/i18n';

type RemoteAngularPageProps = {
  theme: ShellTheme;
  locale: AppLocale;
};

function loadAngularRemote() {
  return import('angular_remote/mount');
}

export function RemoteAngularPage({ theme, locale }: RemoteAngularPageProps) {
  return (
    <RemoteSlot
      basename="/remote-angular"
      loader={loadAngularRemote}
      theme={theme}
      locale={locale}
    />
  );
}
