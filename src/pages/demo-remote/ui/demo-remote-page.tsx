import { RemoteSlot } from '@/mf/RemoteSlot';

export function DemoRemotePage() {
  return (
    <RemoteSlot basename="/demo" loader={() => import('demo_remote/mount')} />
  );
}
