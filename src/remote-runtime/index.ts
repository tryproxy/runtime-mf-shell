/**
 * Platform seam beside FSD layers: host remote mount/unmount + bridge.
 * Consumed by App composition and remote Pages. Not an official FSD layer.
 */
export type {
  RemoteFailureStage,
  RemoteHostContext,
  RemoteLifecycleStage,
  RemoteRuntime,
  RemoteRuntimeAdapters,
  RemoteRuntimeClock,
  RemoteSession,
  RemoteSessionSnapshot,
  StartRemoteSessionOptions,
} from './model/remote-runtime';
export { RemoteRuntimeError } from './model/remote-runtime';
export { RemoteRuntimeProvider } from './model/remote-runtime-provider';
export { RemoteSlot } from './ui/remote-slot';
