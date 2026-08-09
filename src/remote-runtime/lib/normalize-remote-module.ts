import type {
  MountRemoteApp,
  RemoteAppInstance,
} from '@platform/runtime-mf-contract';

/**
 * Temporary consumer-local compatibility layer.
 *
 * Canonical parsers live in runtime-mf-contract source, but this shell is pinned
 * to a GitHub revision that predates them. Remove the duplicated checks after a
 * contract release is published and consumed; retain only delivery-wrapper
 * unwrapping here.
 */
export type NormalizedRemoteModule = {
  mount: MountRemoteApp;
};

function isObject(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    ((typeof value === 'object' && value !== null) ||
      typeof value === 'function') &&
    typeof Reflect.get(value, 'then') === 'function'
  );
}

export function normalizeRemoteModule(value: unknown): NormalizedRemoteModule {
  const candidate =
    isObject(value) && 'default' in value
      ? Reflect.get(value, 'default')
      : value;

  if (!isObject(candidate)) {
    throw new TypeError('Loaded remote module must be an object.');
  }

  const mount = Reflect.get(candidate, 'mount');

  if (typeof mount !== 'function') {
    throw new TypeError(
      'Loaded remote module must expose a callable mount function.'
    );
  }

  return {
    mount: (params) =>
      Reflect.apply(mount, candidate, [params]) as RemoteAppInstance,
  };
}

export function normalizeRemoteAppInstance(value: unknown): RemoteAppInstance {
  if (!isObject(value)) {
    throw new TypeError('Remote mount must return an instance object.');
  }

  const unmount = Reflect.get(value, 'unmount');

  if (typeof unmount !== 'function') {
    throw new TypeError(
      'Remote application instance must expose a callable unmount function.'
    );
  }

  const ready = Reflect.get(value, 'ready');

  if (ready !== undefined && !isPromiseLike(ready)) {
    throw new TypeError(
      'Remote application readiness must be promise-like when provided.'
    );
  }

  return {
    unmount: () => Reflect.apply(unmount, value, []),
    ...(ready === undefined
      ? {}
      : { ready: Promise.resolve(ready).then(() => undefined) }),
  };
}

export function cleanupInvalidRemoteInstance(value: unknown): void {
  if (!isObject(value)) {
    return;
  }

  const unmount = Reflect.get(value, 'unmount');

  if (typeof unmount === 'function') {
    Reflect.apply(unmount, value, []);
  }
}
