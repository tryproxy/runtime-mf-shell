# Adding a new remote project

This guide describes the current supported path for creating an independently
deployed application and mounting it in `runtime-mf-shell`.

**New React remote:** copy
[runtime-mf-react-remote-starter](https://github.com/tryproxy/runtime-mf-react-remote-starter)
and follow [its README](https://github.com/tryproxy/runtime-mf-react-remote-starter#readme)
for rename, HostBridge, CSS/portals, and hosting. Then return here at
[§11 Register the remote](#11-register-the-remote-in-the-current-shell).
Do not copy `runtime-mf-module` as a product skeleton.

**Existing SPA or Angular:** continue below. The shorter React-only checklist
is [React remote quick start](./react-remote-quick-start.md).

The repositories are independent. A remote does not live in the shell
repository, does not import shell source code, and can use its own framework,
package manager, release process, and hosting provider.

The currently certified producer path is a browser application built with
Vite and `@module-federation/vite`. Do not clone the shell into the remote
repository.

## Current platform boundary

The shell currently knows its top-level remotes at build time. Adding a new
remote therefore requires:

1. a remote repository that publishes a framework-neutral `./mount` expose;
2. a deployed federation artifact reachable by the browser;
3. static registration in the shell followed by a shell deployment.

Runtime discovery and the Composition Catalog are deferred. Until they exist,
deploying a new version at the same configured manifest URL can be independent,
but onboarding a new remote or changing its location requires a shell change.

The core ownership rule is:

| Shell owns                                                 | Remote owns                                   |
| ---------------------------------------------------------- | --------------------------------------------- |
| Top-level route namespace and browser shell chrome         | Routes below the assigned basename            |
| Authentication storage and sign-out behavior               | Product profile, permissions, API DTOs and UI |
| Theme and locale values supplied through `HostBridge`      | Rendering those values inside its mount root  |
| Loading, lifecycle timeouts, failure containment and retry | Framework bootstrap, providers and cleanup    |
| Selecting the approved federation manifest URL             | Building and hosting its executable artifact  |

## 1. Reserve the remote coordinates

Choose these values before writing federation configuration. They must remain
consistent across the remote, shell, navigation document, deployment, and
environment variables.

Example for a fictional Billing remote:

| Coordinate                 | Example                            | Meaning                                      |
| -------------------------- | ---------------------------------- | -------------------------------------------- |
| Shell module id            | `billing`                          | Internal shell key and `nav.json.moduleId`   |
| Route segment              | `billing`                          | Shell route without a leading slash          |
| Basename                   | `/billing`                         | Namespace passed to `mount()`                |
| Federation name            | `billing_admin`                    | Producer name recorded in `mf-manifest.json` |
| Shell alias                | `billing_remote`                   | Runtime alias used in the load request       |
| Expose                     | `./mount`                          | Required public lifecycle module             |
| Load request               | `billing_remote/mount`             | Alias plus expose name                       |
| Shell environment variable | `VITE_BILLING_REMOTE_MANIFEST_URL` | Deployed `mf-manifest.json` URL              |
| Local port                 | `5003`                             | Any unused, stable development port          |

Do not reuse an existing module id, route segment, federation name, alias, or
development port. Local ports already taken: `5000` shell, `5001` React demo,
`5002` Angular, `5003` ASO, `5004` React starter. The Billing `5003` example
below is fictional — pick an unused port.

## 2. Keep the application standalone

A new or existing product application should keep its ordinary standalone
entry, for example `src/main.tsx`, `src/main.ts`, or the framework equivalent.
That entry may own standalone-only behavior such as:

- its top-level router and application chrome;
- standalone authentication bootstrap;
- service worker or PWA registration;
- document-level analytics and browser-global integrations.

Add a second, thin embedded entry for federation. Do not fork product pages or
maintain a second application implementation for the shell.

A useful shape is:

```text
src/
  main.tsx                 # existing standalone entry
  app/
    entry/
      index.ts             # public ./mount barrel
      mount.tsx            # framework adapter + product composition
      remote-app.tsx       # embedded providers/router/root
```

The embedded import graph must not automatically run the standalone entry.
Importing `./mount` must not register a service worker, mutate `document`, start
analytics, create a root, or write credentials.

## 3. Install the platform packages

Pin immutable release tags. Do not use sibling `file:` dependencies between
independent repositories.

With pnpm:

```bash
pnpm add 'github:tryproxy/runtime-mf-contract#v0.5.3'
pnpm add 'github:tryproxy/runtime-mf-adapters#v0.1.3'
pnpm add -D '@module-federation/vite@^1.20.5'
```

With npm:

```bash
npm install 'github:tryproxy/runtime-mf-contract#v0.5.3'
npm install 'github:tryproxy/runtime-mf-adapters#v0.1.3'
npm install --save-dev '@module-federation/vite@^1.20.5'
```

The remote installs only the adapter for its framework through a package
subpath:

```ts
import { createReactRemoteMount } from '@platform/runtime-mf-adapters/react';
// or
import { createAngularRemoteMount } from '@platform/runtime-mf-adapters/angular';
```

The remote supplies its own React, ReactDOM, or Angular runtime. It does not
install `@module-federation/enhanced`; that is the shell's runtime delivery
adapter.

## 4. Export the lifecycle contract

Every remote exposes the same framework-neutral operation:

```ts
type MountRemoteApp = (params: {
  container: HTMLElement;
  bridge: HostBridge;
  basename: string;
}) => {
  ready?: Promise<void>;
  unmount(): void;
};
```

Use the framework adapter instead of implementing root lifecycle and partial
startup cleanup in every repository.

### React

`src/app/entry/index.ts`:

```ts
export { mount } from './mount';

export type {
  HostBridge,
  MountRemoteApp,
  RemoteAppInstance,
} from '@platform/runtime-mf-contract';
```

`src/app/entry/mount.tsx`:

```tsx
import { createReactRemoteMount } from '@platform/runtime-mf-adapters/react';
import { RemoteApp } from './remote-app';
import './embedded.css';

export const mount = createReactRemoteMount(
  ({ container, bridge, basename }) => (
    <RemoteApp bridge={bridge} basename={basename} mountRoot={container} />
  )
);
```

`RemoteApp` is product-owned. It should install the remote's bridge context,
embedded router, providers, and error boundary. The adapter owns `createRoot`,
readiness, idempotent unmount, and container cleanup.

### Angular

The Angular adapter owns `createApplication`, root attachment, readiness, and
cleanup. The remote supplies its root component and providers:

```ts
import { createAngularRemoteMount } from '@platform/runtime-mf-adapters/angular';
import { RemoteRoot } from './remote-root';

export const mount = createAngularRemoteMount({
  rootComponent: RemoteRoot,
  providers: ({ bridge }) => [{ provide: HOST_BRIDGE, useValue: bridge }],
  configureRoot: ({ component, bridge, container, basename }) => {
    component.setInput('bridge', bridge);
    component.setInput('mountRoot', container);
    component.setInput('basename', basename);
  },
});
```

If Angular Router owns standalone history, do not let it compete with the shell
when embedded. The current Angular reference remote follows
`bridge.navigation` in embedded mode and enables Angular Router only in
standalone mode.

For another framework, implement `MountRemoteApp` directly and preserve the
same readiness, partial-cleanup, and idempotent-unmount behavior.

## 5. Integrate `HostBridge`

`HostBridge` is the only application-level API shared with the shell. A remote
must not import shell stores or shell React components.

Use its facets as follows:

- `theme.getSnapshot()` and `theme.subscribe()` for the embedded theme;
- `i18n.getSnapshot()` and `i18n.subscribe()` for `en` or `ru`;
- `auth.getSnapshot()` and `auth.subscribe()` for coarse shell session state;
- `auth.http.getAccessToken()` immediately before each bearer request;
- `auth.signOut()` to request shell-owned credential cleanup and navigation;
- `navigation` for the current host location and navigation below `basename`;
- `telemetry` for errors and events that should reach the host's observability
  adapter.

Never read or write the shell's token in remote `localStorage`. Do not cache a
bridge token in a module singleton. The shell may refresh or replace it between
requests.

Create user-bound objects such as API clients, routers, query clients, and
stores per mount session. Dispose their subscriptions and clear session-bound
state during unmount.

## 6. Keep routing below `basename`

The shell owns `/billing/*`; the Billing remote owns only the part below
`/billing`.

For React Router, an embedded `BrowserRouter` may use the supplied basename:

```tsx
<BrowserRouter basename={basename}>
  <ProductRoutes />
</BrowserRouter>
```

For a custom router or another framework, derive its internal location from
`bridge.navigation.getSnapshot()` and strip the basename exactly once. Do not
send `/billing/billing/invoices` back to the router. Navigation emitted to the
shell must remain inside the assigned namespace.

Keep redirects, dynamic detail routes, and hidden routes inside the remote.
Only stable shell-visible pages belong in `nav.json`.

## 7. Publish shell navigation metadata

`mf-manifest.json` and `nav.json` are different documents:

| File               | Producer                 | Purpose                                               |
| ------------------ | ------------------------ | ----------------------------------------------------- |
| `mf-manifest.json` | Module Federation plugin | Executable entries, exposes, chunks, CSS, and assets  |
| `nav.json`         | Remote application build | Product pages the shell may show before mounting code |

Define the navigation contribution in TypeScript and project framework routes,
standalone navigation, and emitted JSON from that one source:

```ts
import type { NavManifest } from '@platform/runtime-mf-contract';

export const billingNavManifest = {
  contractVersion: 1,
  moduleId: 'billing',
  pages: [
    {
      id: 'overview',
      segment: '',
      label: { en: 'Overview', ru: 'Обзор' },
    },
    {
      id: 'invoices',
      segment: 'invoices',
      label: { en: 'Invoices', ru: 'Счета' },
    },
  ],
} as const satisfies NavManifest;
```

The current schema requires:

- `contractVersion: 1`;
- `moduleId` exactly equal to the shell module id;
- unique page ids and segments;
- `segment` relative to the basename, with no leading slash, `..`, URL scheme,
  backslash, query, or hash;
- both English and Russian plain-text labels.

Spanish shell mode currently falls back to English for remote metadata.

Emit and serve this value as `/nav.json` during both development and build. The
current React and Angular reference remotes contain a small
`vite-plugin-rmf-nav-json.ts` implementation that can be reused until this
emitter becomes shared platform tooling.

## 8. Configure the Module Federation producer

A browser-only Vite producer needs the current federation plugin, a unique
name, and the standard expose:

```ts
import { federation } from '@module-federation/vite';
import { defineConfig } from 'vite';
import { rmfNavJson } from './vite-plugin-rmf-nav-json';

function omitUnavailableSsrEntry(stats: Record<string, unknown>) {
  const metaData = stats.metaData;

  if (typeof metaData !== 'object' || metaData === null) {
    return stats;
  }

  return {
    ...stats,
    metaData: Object.fromEntries(
      Object.entries(metaData).filter(([key]) => key !== 'ssrRemoteEntry')
    ),
  };
}

export default defineConfig({
  plugins: [
    federation({
      name: 'billing_admin',
      filename: 'remoteEntry.js',
      manifest: {
        additionalData: ({ stats }) => omitUnavailableSsrEntry(stats),
      },
      dts: false,
      shared: {},
      exposes: {
        './mount': './src/app/entry/index.ts',
      },
    }),
    rmfNavJson(),
  ],
  server: {
    origin: 'http://localhost:5003',
    port: 5003,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5003,
    strictPort: true,
    cors: true,
  },
});
```

The metadata adjustment removes the plugin's default SSR entry declaration
from a browser-only build that does not emit `remoteEntry.ssr.js`.

Use `shared: {}` for the current pilot. React, ReactDOM, Angular, routers, and
framework contexts stay inside the remote artifact; framework values must not
cross the mount contract.

For React development, use the same HMR policy as the React reference remote if
the exposed graph emits `$RefreshSig$` or `$RefreshReg$` references that are not
available in the shell. The current reference disables remote Vite HMR and uses
full shell reloads while editing a remote.

Do not enable `bundleAllCSS` blindly. Ensure the `./mount` graph references the
embedded stylesheet it actually needs without also injecting standalone global
CSS into the shell.

## 9. Contain CSS, portals, and browser globals

The remote shares the shell document. Its styles and side effects can therefore
break shell chrome even when its React or Angular root is separate.

Before deployment:

- mark or wrap the supplied mount container with a remote-owned selector;
- scope embedded CSS below that selector;
- do not ship unscoped `html`, `body`, `:root`, `*`, reset, or preflight rules
  through the federation expose;
- keep the standalone stylesheet available to the standalone entry;
- place dialog, dropdown, select, tooltip, toast, and other portal roots inside
  the mount container;
- clean portal nodes, subscriptions, focus state, and scroll locks on unmount;
- keep service workers, PWA setup, document language, and document theme
  mutations in standalone-only startup code.

The shell does not provide product modals or toasts. A remote may retain its own
UI primitives, but their portal target must stay inside its visual boundary.

## 10. Build and host the remote artifact

Build using the repository's package manager and inspect the resulting output.
The deployed origin must serve real files for:

```text
mf-manifest.json
remoteEntry.js
nav.json
the exposed mount chunk
all referenced JavaScript chunks
CSS, fonts, images, and other referenced assets
```

SPA fallback rules must not rewrite those files to `index.html`.

Cross-origin responses must allow the deployed shell origin to read `nav.json`
and the manifest, entry, JavaScript, CSS, font, and asset graph. Prefer the
exact shell origin when the hosting provider supports only a static
`Access-Control-Allow-Origin` value.

Caching policy:

- `mf-manifest.json`, `remoteEntry.js`, and `nav.json`: revalidate or
  `no-cache, no-store` while they use stable names;
- hashed chunks, CSS, fonts, and images: long-lived immutable caching.

Open `https://<remote-origin>/mf-manifest.json` and
`https://<remote-origin>/nav.json` directly before configuring the shell. The
federation manifest name must equal the reserved federation name, expose
`./mount`, and reference files that actually exist.

## 11. Register the remote in the current shell

Static onboarding currently touches several shell composition files. Keep all
reserved coordinates aligned.

### Add the environment variable

Declare and document the manifest URL:

```ts
// src/shared/env.d.ts
readonly VITE_BILLING_REMOTE_MANIFEST_URL?: string;
```

```dotenv
# env.example
VITE_BILLING_REMOTE_MANIFEST_URL=http://localhost:5003/mf-manifest.json
```

Set the deployed URL in the shell hosting environment before redeploying the
shell.

### Register federation delivery

In `src/app/remote-runtime/remote-runtime-composition.ts`:

```ts
const billingManifestUrl = import.meta.env.VITE_BILLING_REMOTE_MANIFEST_URL;

const remoteRequests: Record<string, string> = {
  // existing remotes
  billing: 'billing_remote/mount',
};

const federationRuntime = createInstance({
  name: 'runtime_mf_shell',
  remotes: [
    // existing remotes
    ...(billingManifestUrl
      ? [
          {
            name: 'billing_admin',
            alias: 'billing_remote',
            entry: billingManifestUrl,
          },
        ]
      : []),
  ],
});
```

`name` must match the deployed `mf-manifest.json`; `alias` must match the load
request prefix. If a shell deployment may omit the environment variable, return
a clear contained configuration error from `loadRemote('billing')`, following
the existing optional-remote pattern.

### Add shell navigation and route composition

Add the top-level module to
`src/app/remote-navigation/nav-config.ts` with empty `pages`; runtime
`nav.json` fills the child pages:

```ts
{
  id: 'billing',
  path: 'billing',
  labelKey: 'nav.billing',
  descriptionKey: 'nav.billingDesc',
  pages: [],
}
```

Add the corresponding English, Russian, and Spanish shell-owned module
label and description (`en.ts` / `ru.ts` / `es.ts`). Remote `nav.json`
labels may omit `es`; the shell then falls back to English for that
metadata.

Create a shell page that only supplies host state to `RemoteSlot`:

```tsx
export function BillingPage({ theme, locale }: BillingPageProps) {
  return (
    <RemoteSlot
      remoteId="billing"
      basename="/billing"
      theme={theme}
      locale={toRemoteLocale(locale)}
    />
  );
}
```

Export it from its page public API, add a small route composition function in
`src/app/routing/route-elements.tsx`, and add `billing: <BillingRoute />` to the
object passed into `buildModuleRoutes()` in `src/app/routing/app-router.tsx`.
The route builder creates the `/billing/*` splat route so the slot remains
mounted while internal paths change.

### Register navigation loading

Add the same module id and federation manifest URL to `REMOTE_NAV_SOURCES`
in `src/app/remote-navigation/remote-nav-sources.ts`. The provider
(`remote-nav-manifests-provider.tsx`) owns boot `ensureNav` / retry
subscription; it is not the static source table.

The current PoC derives `/nav.json` from the origin of the federation manifest.
The remote must therefore host both documents on the same origin. This
duplication between delivery and navigation configuration is temporary and will
move into the Composition Catalog.

## 12. Local and deployed verification

For local work:

1. start the remote on its reserved port;
2. set the shell manifest variable to the local `mf-manifest.json`;
3. start the shell;
4. authenticate in the shell and open the assigned route.

Before calling onboarding complete, manually confirm:

- the application still starts through its standalone entry;
- the shell loads `mf-manifest.json`, `remoteEntry.js`, the mount chunk, CSS,
  and referenced assets without missing-file or CORS responses;
- `nav.json` appears in shell navigation and every visible target has a real
  remote route;
- direct links, nested navigation, browser back/forward, and refresh remain
  below the assigned basename;
- theme and locale changes apply without a new shell `RemoteRuntime.start()`
  (inner React remount is a separate question);
- authenticated requests obtain credentials through `bridge.auth.http`;
- shell sign-out clears the shell session;
- leaving the module unmounts it, and re-entering creates a clean session;
- remote errors remain inside the remote slot;
- shell chrome and other remotes remain visually unchanged after mount and
  unmount.

Deploy the remote first, verify its public artifacts, then configure and deploy
the shell. Do not point a production shell at a development server.

Host-level browser checks live in `runtime-mf-shell` only. Do not install
Playwright in the remote. After the React demo path is running locally:

```bash
pnpm playwright:install   # once per machine
pnpm test:e2e             # from the shell repository
```

That suite proves the currently registered React demo under `/remote`. For a
newly registered remote, reuse it by overriding coordinates as listed in
[`e2e/README.md`](../e2e/README.md). The Playwright webServer still starts
sibling `runtime-mf-module`; for any other origin start that remote yourself
and use `E2E_SKIP_WEBSERVER=1`. It does not replace standalone remote checks
or Angular-specific proof.

## Reference implementations

- `runtime-mf-module`: React remote, React Router basename, bridge hooks, and
  `nav.json` projection.
- `runtime-mf-react-remote-starter`: greenfield React remote (`starter`, port
  `5004`). Not registered in the shell. Rename from its README; do not copy
  `runtime-mf-module` as a product skeleton.
- `runtime-mf-module-angular`: Angular remote, embedded navigation adaptation,
  DI bridge, and async lifecycle.
- `runtime-mf-adapters`: framework root lifecycle and cleanup.
- `runtime-mf-contract`: authoritative contract types and parsers.
- [Runtime Microfrontend Guide](./runtime.md): current shell operation.
- [Runtime contract notes](./reserach.local/architecture/runtime-contract.md):
  lifecycle and ownership rationale.
