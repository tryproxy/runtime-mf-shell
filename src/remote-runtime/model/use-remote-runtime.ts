import { useContext } from 'react';
import { RemoteRuntimeContext } from './remote-runtime-context';

export function useRemoteRuntime() {
  const runtime = useContext(RemoteRuntimeContext);

  if (!runtime) {
    throw new Error('RemoteSlot must be rendered inside RemoteRuntimeProvider');
  }

  return runtime;
}
