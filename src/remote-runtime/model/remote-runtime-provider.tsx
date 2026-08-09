import { useState, type PropsWithChildren } from 'react';
import { createRemoteRuntime } from '../lib/create-remote-runtime';
import { RemoteRuntimeContext } from './remote-runtime-context';
import type { RemoteRuntimeAdapters } from './remote-runtime';

type RemoteRuntimeProviderProps = PropsWithChildren<{
  adapters: RemoteRuntimeAdapters;
}>;

export function RemoteRuntimeProvider({
  adapters,
  children,
}: RemoteRuntimeProviderProps) {
  const [runtime] = useState(() => createRemoteRuntime({ adapters }));

  return (
    <RemoteRuntimeContext.Provider value={runtime}>
      {children}
    </RemoteRuntimeContext.Provider>
  );
}
