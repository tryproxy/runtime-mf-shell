# Connect a React remote to the shell

| Starting point                | Path                                                                                                                                                                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **New React app**             | Copy [runtime-mf-react-remote-starter](https://github.com/tryproxy/runtime-mf-react-remote-starter). Rename from [its README](https://github.com/tryproxy/runtime-mf-react-remote-starter#readme). Register the copy: [Shell registration](./shell-registration.md). |
| **Existing Vite + React SPA** | This document (fictional **Store** — rename consistently).                                                                                                                                                                                                           |

Do not copy `runtime-mf-module` as a product skeleton. The starter is not
registered here; there is no `/starter` route until you onboard a copy.

The rest of this page is the existing-SPA path. Package manager for that
walkthrough: **npm** (remote). Shell uses **pnpm**. The starter itself uses
**pnpm**.

More detail (same folder): [Embedded entry](./embedded-entry.md) ·
[CSS and tokens](./css-and-tokens.md) · [Vite federation](./vite-federation.md) ·
[nav.json](./nav-json.md) · [HostBridge](./host-bridge.md) ·
[Shell registration](./shell-registration.md) ·
[Deploy and host](./deploy-hosting.md) · [Guide index](./README.md).

### Reference repositories

| Role                 | Repo                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Shell                | [tryproxy/runtime-mf-shell](https://github.com/tryproxy/runtime-mf-shell) (`dev`)                                                 |
| React demo remote    | [tryproxy/runtime-mf-module](https://github.com/tryproxy/runtime-mf-module) (`dev`)                                               |
| React starter        | [tryproxy/runtime-mf-react-remote-starter](https://github.com/tryproxy/runtime-mf-react-remote-starter) — greenfield React remote |
| Product remote (ASO) | [asmarketr/aso-market-admin](https://github.com/asmarketr/aso-market-admin) (`mf-remote-integraion`)                              |

## TL;DR — how it works

1. **Your app** stays a standalone SPA and also publishes
   `mf-manifest.json` → `remoteEntry.js` → `./mount`, plus `nav.json`.
2. **The shell** owns `/your-app`, chrome, login/token, theme, locale; loads
   `./mount` and calls `mount({ container, bridge, basename })`.
3. **Your app** renders under `basename`, uses `bridge`, returns `unmount()`.
4. **The shell** paints child tabs from `nav.json`. Neither imports the other’s
   source. New apps still need static shell registration.

---

## 1. What you must provide

### From the remote

| Deliverable                                          | Role                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| `./mount`                                            | `mount({ container, bridge, basename })` → `{ unmount(), ready? }` |
| `mf-manifest.json` / `remoteEntry.js` / chunks / CSS | Federation artifact                                                |
| `nav.json`                                           | Child pages for shell chrome (same origin as manifest)             |
| Standalone `main`                                    | App still runs alone                                               |

### Coordinates (pick once)

| Purpose         | Example                          |
| --------------- | -------------------------------- |
| Shell module id | `store`                          |
| Basename        | `/store`                         |
| Federation name | `store_admin`                    |
| Shell alias     | `store_remote`                   |
| Load request    | `store_remote/mount`             |
| Local origin    | `http://localhost:5003`          |
| Shell env       | `VITE_STORE_REMOTE_MANIFEST_URL` |

`moduleId`, federation `name`, and alias are **different**.
`nav.json.moduleId` must match the shell module id.

Ports `5000`–`5004` are taken locally (shell, React demo, Angular, ASO, React
starter). The Store `:5003` example is fictional.

### From the shell

Env + static module + `RemoteSlot` page + i18n + redeploy. Details:
[Shell registration](./shell-registration.md).

---

## 2. Install (remote)

```bash
npm install github:tryproxy/runtime-mf-contract#v0.5.3
npm install github:tryproxy/runtime-mf-adapters#v0.1.3
npm install -D @module-federation/vite@^1.20.5
```

Keep React / ReactDOM remote-owned.

---

## 3. Embedded entry

Keep `src/main.tsx`. Add:

```text
src/app/entry/index.ts
src/app/entry/mount.tsx
src/app/entry/remote-app.tsx
src/app/embedded-style.css
src/app/model/nav-manifest.ts
vite-plugin-rmf-nav-json.ts
postcss-embedded-style-scope.js
postcss.config.js
```

Copy from:

- [`runtime-mf-module/.../mount.tsx`](https://github.com/tryproxy/runtime-mf-module/blob/dev/src/app/entry/mount.tsx)
- Product mount (container attribute + dispose): [ASO `mount.tsx`](https://github.com/asmarketr/aso-market-admin/blob/mf-remote-integraion/src/app/entry/mount.tsx)
- [`vite-plugin-rmf-nav-json.ts`](https://github.com/tryproxy/runtime-mf-module/blob/dev/vite-plugin-rmf-nav-json.ts)

### `index.ts`

```ts
export { mount } from './mount';
```

### `mount.tsx`

Set the embedded root on the **shell container**:

```tsx
import { createReactRemoteMount } from '@platform/runtime-mf-adapters/react';
import type { MountRemoteApp } from '@platform/runtime-mf-contract';
import { RemoteApp } from './remote-app';
import '../embedded-style.css';

export const mount: MountRemoteApp = (params) => {
  params.container.setAttribute('data-store-embedded', '');

  const mountReact = createReactRemoteMount(
    ({ container, bridge, basename }) => (
      <RemoteApp bridge={bridge} basename={basename} mountRoot={container} />
    )
  );

  const instance = mountReact(params);
  return {
    ready: instance.ready,
    unmount() {
      try {
        instance.unmount();
      } finally {
        params.container.removeAttribute('data-store-embedded');
      }
    },
  };
};
```

### Product composition

- HostBridge via props/context; `<BrowserRouter basename={basename}>`
- API/query clients **per mount**; portals inside `mountRoot`
- No `main.tsx`, PWA, SW, or standalone analytics on this path
- **Scroll:** shell owns page scroll — no second full-viewport scroller
- **Chrome:** hide product sidebar/header when embedded

Full dual-mode rules: [Embedded entry](./embedded-entry.md). Also
[HostBridge](./host-bridge.md) · [CSS and tokens](./css-and-tokens.md).

---

## 4. `nav.json`

```ts
import type { NavManifest } from '@platform/runtime-mf-contract';

export const storeNavManifest = {
  contractVersion: 1,
  moduleId: 'store',
  pages: [
    { id: 'overview', segment: '', label: { en: 'Overview', ru: 'Обзор' } },
    {
      id: 'catalog',
      segment: 'catalog',
      label: { en: 'Catalog', ru: 'Каталог' },
    },
  ],
} as const satisfies NavManifest;
```

Wire [`vite-plugin-rmf-nav-json.ts`](https://github.com/tryproxy/runtime-mf-module/blob/dev/vite-plugin-rmf-nav-json.ts)
to emit/serve `/nav.json`. Full rules: [nav.json](./nav-json.md).

---

## 5. `vite.config.ts`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
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
    react(),
    rmfNavJson(),
    federation({
      name: 'store_admin',
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
  ],
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
  build: {
    target: 'esnext',
  },
});
```

Before shell wiring, open `/mf-manifest.json` and `/nav.json` (must be JSON).
More: [Vite federation](./vite-federation.md).

---

## 6. CSS, tokens, Tailwind

Shell provides `--rmf-*` on `html` and theme via `bridge` — see
[`tokens.css`](https://github.com/tryproxy/runtime-mf-shell/blob/dev/src/shared/styles/tokens.css).

Import **only** `embedded-style.css` from `./mount`. Scope to
`[data-store-embedded]`. **Required** with Tailwind preflight: PostCSS scope
plugin ([ASO example](https://github.com/asmarketr/aso-market-admin/blob/mf-remote-integraion/postcss-embedded-style-scope.js)).

```css
/* embedded-style.css */
[data-store-embedded] {
  min-height: 0;
  overflow: visible;
  overscroll-behavior: contain;
}
```

```js
// postcss.config.js
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { embeddedStyleScope } from './postcss-embedded-style-scope.js';

export default {
  plugins: [tailwindcss(), autoprefixer(), embeddedStyleScope()],
};
```

Prefer **Tailwind `^3.4`** for product PostCSS apps. Full write-up:
[CSS and tokens](./css-and-tokens.md).

---

## 7. HostBridge

| Do                                  | Don’t                                |
| ----------------------------------- | ------------------------------------ |
| Theme/locale/session from `bridge`  | Own shell chrome / top-level history |
| `bridge.auth.http.getAccessToken()` | Token in remote `localStorage`       |
| `bridge.auth.signOut()`             | Clear shell storage yourself         |
| Stay under `basename`               | SW / web-push while embedded         |

Detail: [HostBridge](./host-bridge.md).

---

## 8. Register in the shell

Static onboarding — file list and sketches:
[Shell registration](./shell-registration.md).

```dotenv
VITE_STORE_REMOTE_MANIFEST_URL=http://localhost:5003/mf-manifest.json
```

```tsx
<RemoteSlot
  remoteId="store"
  basename="/store"
  theme={theme}
  locale={toRemoteLocale(locale)}
/>
```

---

## 9. Local check

1. Remote `npm run dev` on `:5003`.
2. Confirm JSON at `/mf-manifest.json` and `/nav.json`.
3. Shell: `pnpm dev` with the env var set.
4. Sign in → `/store` → tabs, nested routes, leave/re-enter, no second header,
   shell owns scroll, standalone still works.

Host-level Playwright is shell-owned (`pnpm test:e2e` in `runtime-mf-shell`).
It currently targets the registered React demo (`/remote`), not this fictional
Store example. Do not install Playwright in the remote. Operator notes:
[e2e/README.md](../../e2e/README.md).

---

## 10. Deploy

Serve `mf-manifest.json`, `remoteEntry.js`, `nav.json`, and referenced assets.
CORS for shell origin; revalidate stable names; hashed assets immutable; no SPA
fallback over those files.

```dotenv
VITE_STORE_REMOTE_MANIFEST_URL=https://store.example.com/mf-manifest.json
```

Confirm hosted `/mf-manifest.json` and `/nav.json` in the browser, set the env
on the **shell**, redeploy the shell. Preview vs prod, cache, and SPA traps:
[Deploy and host](./deploy-hosting.md).

---

## Done when

- [ ] Standalone still works
- [ ] `/store` mounts; `nav.json` fills child nav
- [ ] Nested routes / history under `/store`
- [ ] Auth via bridge; logout via `signOut()`
- [ ] Clean leave/re-enter
- [ ] No second product chrome; shell owns page scroll
- [ ] Remote failure does not take down shell chrome

Host Playwright (`pnpm test:e2e` in the shell) covers the registered React
demo. A new product remote still needs the manual checks above.
