import { useContext } from 'react';
import { RemoteRuntimeContext } from './remote-runtime-context';

export function useRemoteRuntime() {
  const adapters = useContext(RemoteRuntimeContext);

  if (!adapters) {
    throw new Error('RemoteSlot must be rendered inside RemoteRuntimeProvider');
  }

  return adapters;
}
