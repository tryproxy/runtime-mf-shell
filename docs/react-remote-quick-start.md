# React remote quick start

Use this checklist to connect an existing Vite + React application to
`runtime-mf-shell` without removing its standalone entry.

This is the short implementation path. See
[Adding a new remote project](./adding-a-new-remote.md) for lifecycle rationale,
Angular, CSS isolation details, hosting examples, and failure policies.

## Choose the identifiers once

This guide uses a fictional Billing remote:

| Purpose                | Value                              |
| ---------------------- | ---------------------------------- |
| Shell module id        | `billing`                          |
| Shell route / basename | `/billing`                         |
| Federation name        | `billing_admin`                    |
| Federation alias       | `billing_remote`                   |
| Load request           | `billing_remote/mount`             |
| Local remote origin    | `http://localhost:5003`            |
| Shell env variable     | `VITE_BILLING_REMOTE_MANIFEST_URL` |

Replace `billing` consistently. The module id, federation name, and alias are
different identifiers. Local ports `5000`–`5004` are already used (shell, React
demo, Angular, ASO, React starter). The `5003` values below are a fictional
example — pick an unused port.

## React remote repository

### 1. Install the platform packages

```bash
pnpm add 'github:tryproxy/runtime-mf-contract#v0.5.2'
pnpm add 'github:tryproxy/runtime-mf-adapters#v0.1.2'
pnpm add -D '@module-federation/vite@^1.20.5'
```

For npm, use `npm install` and `npm install --save-dev` with the same package
specifications. Keep React and ReactDOM owned by the remote.

### 2. Add the embedded entry

Keep the existing `src/main.tsx` for standalone startup. Add:

```text
src/app/entry/index.ts
src/app/entry/mount.tsx
src/app/entry/remote-app.tsx
src/app/embedded.css
```

`src/app/entry/index.ts`:

```ts
export { mount } from './mount';
```

`src/app/entry/mount.tsx`:

```tsx
import { createReactRemoteMount } from '@platform/runtime-mf-adapters/react';
import { RemoteApp } from './remote-app';
import '../embedded.css';

export const mount = createReactRemoteMount(
  ({ container, bridge, basename }) => (
    <RemoteApp bridge={bridge} basename={basename} mountRoot={container} />
  )
);
```

In `remote-app.tsx`, compose the existing product application with:

- a local `HostBridge` provider or bridge props;
- `<BrowserRouter basename={basename}>`;
- API/router/query clients created per mount;
- an error boundary and a portal root inside `mountRoot`;
- an embedded root selector used by `embedded.css`.

Do not import `src/main.tsx`. PWA registration, standalone login bootstrap,
document globals, and standalone analytics must not run when `./mount` loads.

### 3. Add `nav.json`

Create `src/app/model/nav-manifest.ts`:

```ts
import type { NavManifest } from '@platform/runtime-mf-contract';

export const billingNavManifest = {
  contractVersion: 1,
  moduleId: 'billing',
  pages: [
    { id: 'overview', segment: '', label: { en: 'Overview', ru: 'Обзор' } },
    {
      id: 'invoices',
      segment: 'invoices',
      label: { en: 'Invoices', ru: 'Счета' },
    },
  ],
} as const satisfies NavManifest;
```

Build the React Router routes from this same source. Segments are relative to
`/billing` and never include the basename.

Copy `vite-plugin-rmf-nav-json.ts` from `runtime-mf-module`, point it at
`billingNavManifest`, and register `rmfNavJson()` in Vite. It serves
`/nav.json` in development and emits it during build.

### 4. Configure federation in `vite.config.ts`

Add `@module-federation/vite` to the existing plugin list:

```ts
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
});
```

Copy `omitUnavailableSsrEntry` from the
[full producer example](./adding-a-new-remote.md#8-configure-the-module-federation-producer).
It prevents a browser-only manifest from advertising a missing SSR entry.

Merge these development settings:

```ts
server: {
  origin: 'http://localhost:5003',
  port: 5003,
  strictPort: true,
  cors: true,
  hmr: false,
},
preview: {
  port: 5003,
  strictPort: true,
  cors: true,
},
```

Keep `shared: {}`. Do not enable `bundleAllCSS` by default.

### 5. Follow the bridge boundary

- Read theme, locale, session, navigation, and telemetry from `HostBridge`.
- Get a bearer token per request with `bridge.auth.http.getAccessToken()`.
- Never read or persist the shell token in remote `localStorage`.
- Request logout through `bridge.auth.signOut()`.
- Keep all embedded routes below `basename`.
- Scope embedded CSS to the mount root and keep portals inside it.

## Shell repository

### 6. Add the static registration

Current onboarding is static, so update every row below and redeploy the shell.

| Shell file                                             | Add                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `src/shared/env.d.ts`                                  | Optional `VITE_BILLING_REMOTE_MANIFEST_URL`                                  |
| `env.example`                                          | Local manifest URL                                                           |
| `src/app/remote-runtime/remote-runtime-composition.ts` | Manifest variable, load request, federation descriptor, missing-config error |
| `src/app/remote-navigation/nav-config.ts`              | Top-level module with `pages: []`                                            |
| `src/shared/i18n/locales/en.ts`                        | Module label and description                                                 |
| `src/shared/i18n/locales/ru.ts`                        | Module label and description                                                 |
| `src/shared/i18n/locales/es.ts`                        | Module label and description                                                 |
| `src/pages/billing/`                                   | Thin `RemoteSlot` page and public export                                     |
| `src/app/routing/route-elements.tsx`                   | `BillingRoute` composition                                                   |
| `src/app/routing/app-router.tsx`                       | `billing: <BillingRoute />`                                                  |
| `src/app/remote-navigation/remote-nav-sources.ts`      | Conditional `{ moduleId, federationEntryUrl }`                               |

Environment declaration and local value:

```ts
readonly VITE_BILLING_REMOTE_MANIFEST_URL?: string;
```

```dotenv
VITE_BILLING_REMOTE_MANIFEST_URL=http://localhost:5003/mf-manifest.json
```

Federation mapping in `remote-runtime-composition.ts`:

```ts
const billingManifestUrl = import.meta.env.VITE_BILLING_REMOTE_MANIFEST_URL;

// remoteRequests
billing: 'billing_remote/mount',

// createInstance({ remotes })
...(billingManifestUrl
  ? [{ name: 'billing_admin', alias: 'billing_remote', entry: billingManifestUrl }]
  : []),
```

Module entry in `nav-config.ts`:

```ts
{
  id: 'billing',
  path: 'billing',
  labelKey: 'nav.billing',
  descriptionKey: 'nav.billingDesc',
  pages: [],
}
```

The page under `src/pages/billing/` only mounts the slot:

```tsx
<RemoteSlot
  remoteId="billing"
  basename="/billing"
  theme={theme}
  locale={toRemoteLocale(locale)}
/>
```

Add its route element to `buildModuleRoutes()`:

```tsx
billing: <BillingRoute />,
```

Add the same module to `REMOTE_NAV_SOURCES` in
`src/app/remote-navigation/remote-nav-sources.ts` (the provider only
subscribes and calls `ensureNav`; it is not the source table):

```ts
const billingManifestUrl = import.meta.env.VITE_BILLING_REMOTE_MANIFEST_URL;

...(billingManifestUrl
  ? [{ moduleId: 'billing', federationEntryUrl: billingManifestUrl }]
  : []),
```

The current shell derives `/nav.json` from the federation manifest origin, so
both files must be hosted at the same origin root.

## Deploy

Deploy the remote before changing the deployed shell. Its origin must serve:

```text
mf-manifest.json
remoteEntry.js
nav.json
all referenced JavaScript, CSS, fonts, and assets
```

- Allow the deployed shell origin through CORS.
- Revalidate stable `mf-manifest.json`, `remoteEntry.js`, and `nav.json` names.
- Long-cache only hashed assets.
- Keep those real files ahead of the SPA fallback rewrite.

Then set the shell deployment variable and redeploy the shell:

```dotenv
VITE_BILLING_REMOTE_MANIFEST_URL=https://billing.example.com/mf-manifest.json
```

## Done when

- Standalone startup still works.
- `/billing` mounts and `nav.json` fills shell child navigation.
- Nested routes, refresh, and browser back/forward stay below `/billing`.
- Auth requests, theme, locale, and logout use the bridge.
- Leaving and re-entering creates a clean mount session.
- Remote CSS, portals, or failures do not break shell chrome.

Host-level Playwright for the registered React demo lives in the shell
(`pnpm test:e2e`). Do not add Playwright to the remote. Details:
[e2e/README.md](../e2e/README.md).
