import type { PropsWithChildren } from 'react';
import {
  RemoteRuntimeContext,
  type RemoteRuntimeAdapters,
} from './remote-runtime-context';

type RemoteRuntimeProviderProps = PropsWithChildren<{
  adapters: RemoteRuntimeAdapters;
}>;

export function RemoteRuntimeProvider({
  adapters,
  children,
}: RemoteRuntimeProviderProps) {
  return (
    <RemoteRuntimeContext.Provider value={adapters}>
      {children}
    </RemoteRuntimeContext.Provider>
  );
}
