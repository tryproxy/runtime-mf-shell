import { createContext } from 'react';
import type { RemoteRuntime } from './remote-runtime';

export const RemoteRuntimeContext = createContext<RemoteRuntime | null>(null);
