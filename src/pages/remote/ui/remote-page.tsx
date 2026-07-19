import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/model/theme';

type RemotePageProps = {
  theme: ShellTheme;
};

export function RemotePage({ theme }: RemotePageProps) {
  return (
    <RemoteSlot
      basename="/remote"
      loader={() => import('demo_remote/mount')}
      theme={theme}
    />
  );
}
