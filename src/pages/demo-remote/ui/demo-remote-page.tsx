import type { ShellTheme } from '@/app/app';
import { RemoteSlot } from '@/mf/RemoteSlot';

type DemoRemotePageProps = {
  theme: ShellTheme;
};

export function DemoRemotePage({ theme }: DemoRemotePageProps) {
  return (
    <RemoteSlot
      basename="/demo"
      loader={() => import('demo_remote/mount')}
      theme={theme}
    />
  );
}
