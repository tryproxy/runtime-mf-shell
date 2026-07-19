import { RemoteSlot } from '@/remote-runtime';
import type { ShellTheme } from '@/shared/model/theme';

type RemotePageProps = {
  theme: ShellTheme;
};

function loadDemoRemote() {
  return import('demo_remote/mount');
}

export function RemotePage({ theme }: RemotePageProps) {
  return (
    <RemoteSlot basename="/remote" loader={loadDemoRemote} theme={theme} />
  );
}
