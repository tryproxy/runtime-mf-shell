# nav.json

Detail for remote child navigation. Summary: [React remote guide](./react-remote.md) §4.

The shell paints module **child tabs** from `nav.json` before (and without)
executing product UI. Top-level module id / basename stay shell-owned.

## Single TypeScript source

```ts
import type { NavManifest } from '@platform/runtime-mf-contract';

export const storeNavManifest = {
  contractVersion: 1,
  moduleId: 'store', // must match shell module id
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

Example:
[`runtime-mf-module/.../nav-manifest.ts`](https://github.com/tryproxy/runtime-mf-module/blob/dev/src/app/model/nav-manifest.ts).

## Rules

- `segment` is relative to the module basename (no leading slash, no `/store`).
- `segment: ''` is the module index.
- Optional `label.es`; shell falls back to `en`.
- Build React Router routes from the **same** object.
- Shell `nav-config` keeps `pages: []` and fills them from this file at runtime.

## Emit plugin

Copy
[`vite-plugin-rmf-nav-json.ts`](https://github.com/tryproxy/runtime-mf-module/blob/dev/vite-plugin-rmf-nav-json.ts)
and point it at your manifest export. It must:

- serve `GET /nav.json` in dev (CORS);
- emit `nav.json` into `dist` on build.

Register `rmfNavJson()` in `vite.config.ts`.

## Hosting

`nav.json` must live on the **same origin** as `mf-manifest.json` (PoC: shell
derives the nav URL from the federation manifest origin). Revalidate caching
for the stable name; do not SPA-fallback it to `index.html`.

When a remote origin recovers after a failed load, the Shell's slot-level
**Retry** restarts both the executable remote session and the corresponding
`nav.json` request. Users must not need to leave the module and re-enter it to
restore child navigation.
