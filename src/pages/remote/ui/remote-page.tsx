import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/config';
import type { AppLocale } from '@/shared/i18n';

type RemotePageProps = {
  theme: ShellTheme;
  locale: AppLocale;
};

export function RemotePage({ theme, locale }: RemotePageProps) {
  return (
    <RemoteSlot
      basename="/remote"
      remoteId="remote"
      theme={theme}
      locale={locale}
    />
  );
}
