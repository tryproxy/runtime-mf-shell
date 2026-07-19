import { RemoteSlot } from '@/remote-runtime';
import type { AppLocale } from '@/shared/i18n';
import type { ShellTheme } from '@/shared/model';

type RemotePageProps = {
  theme: ShellTheme;
  locale: AppLocale;
};

function loadDemoRemote() {
  return import('demo_remote/mount');
}

export function RemotePage({ theme, locale }: RemotePageProps) {
  return (
    <RemoteSlot
      basename="/remote"
      loader={loadDemoRemote}
      theme={theme}
      locale={locale}
    />
  );
}
