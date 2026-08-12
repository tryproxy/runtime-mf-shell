# Embedded entry (dual-mode)

Detail for the federation `./mount` path. Summary:
[React remote guide](./react-remote.md) §3.

One product app, two entries:

| Entry                          | When                | Owns                                                              |
| ------------------------------ | ------------------- | ----------------------------------------------------------------- |
| `src/main.tsx` (or equivalent) | Standalone SPA      | Product chrome, own auth bootstrap, PWA/SW, document analytics    |
| `src/app/entry` → `./mount`    | Loaded by the shell | Thin bootstrap only: adapters, providers, router under `basename` |

Do **not** fork product pages into a second app. Importing `./mount` must not
run `main.tsx`, register a service worker, write credentials, or create a
second document root.

## Files

```text
src/main.tsx                    # keep
src/app/entry/index.ts          # export { mount }
src/app/entry/mount.tsx         # adapter + data-* + dispose
src/app/entry/remote-app.tsx    # providers / BrowserRouter / product root
```

Copy shapes from:

- Demo: [`runtime-mf-module/.../mount.tsx`](https://github.com/tryproxy/runtime-mf-module/blob/dev/src/app/entry/mount.tsx)
- Product (attribute + dispose): [ASO `mount.tsx`](https://github.com/asmarketr/aso-market-admin/blob/mf-remote-integraion/src/app/entry/mount.tsx)

## `mount` contract

```ts
mount({ container, bridge, basename }) → { unmount(), ready? }
```

1. Mark the **shell-owned** `container` (e.g. `data-store-embedded`) for CSS
   scope.
2. Call `createReactRemoteMount(...)` from
   `@platform/runtime-mf-adapters/react`.
3. Render product composition with `bridge`, `basename`, and `mountRoot`.
4. On `unmount`, tear down React and clear the attribute.

Code sample: [React remote guide](./react-remote.md) §3.

## Product composition rules

- Pass `HostBridge` via props/context — see [HostBridge](./host-bridge.md).
- Use `<BrowserRouter basename={basename}>` (or framework equivalent).
- Create API / React Query (or similar) clients **per mount**; dispose on
  unmount.
- Portals (modals, selects, toasts) must target `mountRoot` / the embedded
  container — not `document.body` alone if that escapes the slot.
- **Chrome:** hide product sidebar / top bar when embedded; keep them for
  standalone.
- **Scroll:** shell owns page scroll — avoid a second full-viewport scroller
  inside the remote.
- Disable SW / web-push / standalone-only analytics on the embedded path.

## Related

- [CSS and tokens](./css-and-tokens.md) — scope attribute + `embedded-style.css`
- [HostBridge](./host-bridge.md) — auth, theme, locale while mounted
