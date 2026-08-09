import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/config';
import type { AppLocale } from '@/shared/i18n';

type RemoteAngularPageProps = {
  theme: ShellTheme;
  locale: AppLocale;
};

export function RemoteAngularPage({ theme, locale }: RemoteAngularPageProps) {
  return (
    <RemoteSlot
      basename="/remote-angular"
      remoteId="remoteAngular"
      theme={theme}
      locale={locale}
    />
  );
}
