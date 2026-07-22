/**
 * Platform seam beside FSD layers: host remote mount/unmount + bridge.
 * Consumed by App composition and remote Pages. Not an official FSD layer.
 */
export type { RemoteRuntimeAdapters } from './model/remote-runtime-context';
export { RemoteRuntimeProvider } from './model/remote-runtime-provider';
export { RemoteSlot } from './ui/remote-slot';
