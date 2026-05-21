# Runtime Microfrontend Guide

This document describes the current runtime microfrontend setup across:

- `runtime-mf-shell`: the host application
- `runtime-mf-module`: the remote application

It is intentionally brief and focused on how the system is structured, how the host and remote communicate, and what to change when the setup grows.

## Purpose

The shell owns the main application frame and routing. The remote is a separately built frontend module that is mounted inside the shell through Module Federation.

At a high level:

1. The shell loads `remoteEntry.js` from the remote app.
2. The shell requests the exposed `./mount` module as `demo_remote/mount`.
3. The remote exports a `mount` function.
4. The shell passes a container element plus a host bridge contract into that `mount` function.
5. The remote renders itself inside that container and uses the bridge to read host state and trigger host navigation.

## Repositories

### Shell

Path:

- `runtime-mf-shell`

Responsibility:

- Own the page shell: sidebar, header, theme toggle, host routes
- Load remotes through Module Federation
- Expose host capabilities to remotes through a typed contract

Important files:

- [vite.config.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/vite.config.ts)
  - registers `demo_remote` as a federation remote
  - contains a local workaround for a dev-time share-scope issue in `@originjs/vite-plugin-federation`
- [src/app/app.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/app/app.tsx)
  - host composition entry
  - owns shell theme state
- [src/widgets/app-shell/ui/app-shell.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/widgets/app-shell/ui/app-shell.tsx)
  - sidebar + header layout
- [src/shared/lib/routing/use-active-page.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/shared/lib/routing/use-active-page.ts)
  - simple pathname-based routing metadata for host pages
- [src/pages/demo-remote/ui/demo-remote-page.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/pages/demo-remote/ui/demo-remote-page.tsx)
  - remote page entry inside the host
- [src/mf/RemoteSlot.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/mf/RemoteSlot.tsx)
  - loads the remote module and calls its `mount` function
- [src/mf/create-host-bridge.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/mf/create-host-bridge.ts)
  - creates the bridge object passed to the remote
- [src/vite-env.d.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/vite-env.d.ts)
  - host-side module declaration for `demo_remote/mount`

### Remote module

Path:

- `runtime-mf-module`

Responsibility:

- Build and expose a mountable remote UI
- Render either standalone or inside the shell
- Consume the host bridge contract

Important files:

- [vite.config.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-module/vite.config.ts)
  - exposes `./mount`
  - serves `remoteEntry.js`
- [src/mount.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-module/src/mount.tsx)
  - remote entrypoint expected by the host
- [src/remote-contract.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-module/src/remote-contract.ts)
  - source of truth for the bridge types inside the remote
- [src/app/remote-app.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-module/src/app/remote-app.tsx)
  - wrapper used when mounted by the shell
- [src/app/app.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-module/src/app/app.tsx)
  - actual remote UI
  - supports standalone mode and embedded host mode

## Current structure

### Shell structure

The shell roughly follows a lightweight FSD-style split:

- `app`
  - entry and top-level composition
- `pages`
  - host page-level UI such as `overview`, `settings`, `demo-remote`
- `widgets`
  - reusable host layout pieces such as `app-shell`
- `shared`
  - helpers, small UI primitives, config, and routing metadata
- `mf`
  - Module Federation-specific host integration code

### Remote structure

The remote is intentionally smaller:

- `app`
  - standalone app and embedded app wrapper
- `mount.tsx`
  - federation entrypoint
- `remote-contract.ts`
  - shared host contract types
- `shared`
  - basic local helpers

## Basic features

### Shell features

- host routes:
  - `/overview`
  - `/settings`
  - `/demo`
  - `/demo/product`
- persistent sidebar
- host header with theme toggle
- light/dark shell theme persisted in `localStorage`
- remote mounting inside `/demo*`

### Remote features

- standalone local app behavior using hash routing
- embedded behavior under host pathname routing
- remote pages:
  - main
  - product
- remote reacts to host theme updates
- remote can trigger host navigation through the bridge

## Federation setup

### Shell side

The shell registers the remote in [vite.config.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/vite.config.ts):

```ts
federation({
  name: 'runtime_mf_shell',
  remotes: {
    demo_remote: 'http://localhost:5001/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],
});
```

The remote import is:

```ts
import('demo_remote/mount');
```

That works because:

- remote key: `demo_remote`
- exposed key: `./mount`
- runtime import form: `demo_remote/mount`

### Remote side

The remote exposes the mount module in [vite.config.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-module/vite.config.ts):

```ts
federation({
  name: 'runtime_mf_module',
  filename: 'remoteEntry.js',
  exposes: {
    './mount': './src/mount.tsx',
  },
  shared: ['react', 'react-dom'],
});
```

Its `mount` function lives in [src/mount.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-module/src/mount.tsx).

## Contract approach

The shell and remote are intentionally connected through a narrow contract instead of shared runtime imports between app internals.

Current bridge shape:

```ts
type HostBridge = {
  theme: {
    getSnapshot(): { mode: 'light' | 'dark' };
    subscribe(listener: () => void): () => void;
  };
  auth: {
    getSession(): {
      userId: string;
      displayName?: string;
      roles: string[];
    } | null;
  };
  navigation: {
    getLocation(): {
      pathname: string;
      search: string;
      hash: string;
    };
    navigate(path: string): void;
    replace(path: string): void;
  };
};
```

Why this approach is useful:

- the shell stays in control of routing, theme, and session
- the remote depends on behavior, not host implementation details
- the remote can be tested standalone with a fake bridge
- the contract can evolve in a deliberate, typed way

What belongs in the contract:

- host-owned state the remote needs to read
- host-owned actions the remote needs to trigger
- stable, framework-agnostic capabilities

What should not go in the contract:

- direct host component references
- broad mutable global objects
- host implementation details that are likely to churn

## How it works at runtime

### 1. Host route selection

The shell resolves the current page from `window.location.pathname` in [src/shared/lib/routing/use-active-page.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/shared/lib/routing/use-active-page.ts).

For remote routes:

- `/demo` maps to the remote main view
- `/demo/product` maps to the remote product view

### 2. Shell renders remote page

The shell route renders [src/pages/demo-remote/ui/demo-remote-page.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/pages/demo-remote/ui/demo-remote-page.tsx), which renders `RemoteSlot`.

### 3. Shell loads remote module

[src/mf/RemoteSlot.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/mf/RemoteSlot.tsx):

- loads `demo_remote/mount`
- normalizes the returned module shape
- creates a container element
- passes `container`, `bridge`, and `basename` into `mount`

### 4. Remote mounts

[runtime-mf-module/src/mount.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-module/src/mount.tsx):

- creates a React root inside the provided container
- renders `RemoteApp`
- returns an object with `unmount()`

### 5. Remote consumes the bridge

The remote uses:

- `bridge.navigation` for host-aware routing
- `bridge.theme.getSnapshot()` plus `bridge.theme.subscribe()` for live theme updates
- `bridge.auth.getSession()` for host session data

## Embedded vs standalone mode

The remote app supports two modes:

### Standalone mode

Used when running the remote by itself.

- route state comes from `window.location.hash`
- navigation uses local hash links

### Embedded mode

Used when the shell mounts the remote.

- route state comes from `window.location.pathname`
- navigation delegates to `bridge.navigation`
- theme is driven by the host bridge

This keeps local remote development easy while still letting the host own the user-facing URL structure.

## Theme propagation

The shell owns the theme and persists it locally.

Flow:

1. The shell toggles theme in [src/app/app.tsx](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/src/app/app.tsx)
2. `RemoteSlot` passes the current theme into the host bridge
3. `createHostBridge` publishes theme changes to subscribers
4. The remote reads theme through `useSyncExternalStore`
5. The remote updates colors without a remount

## Local development

Expected ports:

- shell dev server: `5000`
- remote preview or dev server: `5001`

Typical flow:

1. start the remote on `5001`
2. start the shell on `5000`
3. open the shell and navigate to `/demo`

## Deployment

Deployment is straightforward as long as the shell can reach the remote entry URL.

### What gets deployed

- the shell deploys as the main application
- the remote deploys as a separate static frontend bundle
- the remote must publish its `remoteEntry.js` and the referenced asset files together

### What must match

At deploy time, the shell remote config must point to the real remote entry URL:

- shell expects: `demo_remote -> <remote-base>/assets/remoteEntry.js`

If the remote host, path, or CDN location changes, update the shell federation config accordingly.

### Minimum deployment rules

- deploy shell and remote independently
- keep the remote entry URL stable
- serve remote assets with CORS enabled if shell and remote use different origins
- make sure `remoteEntry.js` and its emitted chunk files stay in the same published asset set
- keep the shell and remote contract compatible when releasing changes

### Recommended release order

When the contract changes:

1. deploy the remote that supports the new contract
2. deploy the shell that starts using it

For non-breaking remote-only UI changes, the remote can be deployed by itself.

### Practical note

The safest production model is:

- shell URL is stable
- remote URL is stable
- shell reads the remote location from config or environment

That keeps federation wiring explicit and avoids rebuilding the shell for every infrastructure-side path change.

## Current caveats

### Federation dev workaround

The shell currently includes a workaround in [vite.config.ts](/mnt/secure/@home/dashweb/dev/dash/selfed/runtime-mf/runtime-mf-shell/vite.config.ts) for a dev-time issue in `@originjs/vite-plugin-federation@1.4.1`, where the generated share-scope placeholder can remain unresolved.

That workaround only exists to stabilize local development. It should be removed once the plugin/runtime path is upgraded or replaced.

### Loader shape normalization

The host loader currently handles both:

- `{ mount }`
- `{ default: { mount } }`

That normalization is required because the federation runtime may wrap the remote module shape.

## Guidance for extending this setup

If the system grows, prefer these rules:

- keep the host contract small and capability-based
- keep the host in control of top-level URLs
- let remotes own their internal view logic
- version contract changes deliberately
- avoid remote imports from host internals other than the explicit federation entry

Good next steps when complexity increases:

- extract contract types into a shared package
- add explicit versioning to the bridge contract
- add integration tests that exercise `/demo` and `/demo/product`
- replace ad hoc pathname handling with a more formal host/remote route adapter if nested remote flows expand
