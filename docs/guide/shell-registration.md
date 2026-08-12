# Shell registration

Detail for static onboarding in `runtime-mf-shell`. Summary:
[React remote guide](./react-remote.md) §8.

Until discovery exists, a **new** remote needs a shell change + shell redeploy.
Updating only the remote artifact is enough for a new **version** at the same
manifest URL.

Shell repo: [tryproxy/runtime-mf-shell](https://github.com/tryproxy/runtime-mf-shell)
(`dev`). Package manager: **pnpm**.

## Files to touch

| File | Add |
| ---- | --- |
| `src/shared/env.d.ts` | `VITE_STORE_REMOTE_MANIFEST_URL?` |
| `env.example` | Local / documented manifest URL |
| `src/app/remote-runtime/remote-runtime-composition.ts` | Manifest URL, alias, load request |
| `src/app/remote-navigation/nav-config.ts` | Module with `pages: []` |
| `src/shared/i18n/locales/en.ts` (+ `ru.ts` / `es.ts`) | Module label keys |
| `src/pages/store/` | Thin `RemoteSlot` page |
| `src/app/routing/route-elements.tsx` | Route composition export |
| `src/app/routing/app-router.tsx` | Wire into `buildModuleRoutes({ … })` |
| `src/app/remote-navigation/remote-nav-manifests-provider.tsx` | Conditional `{ moduleId, federationEntryUrl }` |

## Env

```ts
readonly VITE_STORE_REMOTE_MANIFEST_URL?: string;
```

```dotenv
VITE_STORE_REMOTE_MANIFEST_URL=http://localhost:5003/mf-manifest.json
```

## Composition sketch

Align coordinates with the remote (`store` / `store_admin` / `store_remote`):

```ts
const storeManifestUrl = import.meta.env.VITE_STORE_REMOTE_MANIFEST_URL;

// remoteRequests
store: 'store_remote/mount',

// remotes[]
...(storeManifestUrl
  ? [
      {
        name: 'store_admin',
        alias: 'store_remote',
        entry: storeManifestUrl,
      },
    ]
  : []),
```

```ts
{
  id: 'store',
  path: 'store',
  labelKey: 'nav.store',
  descriptionKey: 'nav.storeDesc',
  pages: [], // filled from remote nav.json
}
```

```tsx
<RemoteSlot
  remoteId="store"
  basename="/store"
  theme={theme}
  locale={toRemoteLocale(locale)}
/>
```

## Reference existing module

ASO registration is the product template to mirror (env, composition, nav,
pages, routes) inside the shell tree — search `aso` /
`VITE_ASO_REMOTE_MANIFEST_URL` in
[runtime-mf-shell](https://github.com/tryproxy/runtime-mf-shell).
