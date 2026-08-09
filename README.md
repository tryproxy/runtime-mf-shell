# runtime-mf-shell

React host for the runtime microfrontend PoC. Remotes (React / Angular) mount into this shell through a shared contract — not by importing shell internals.

For a longer operator guide see [`docs/runtime.md`](./docs/runtime.md). Research / backlog: [`docs/reserach.local/`](./docs/reserach.local/).

---

## What the shell provides

| Capability       | Notes                                                                      |
| ---------------- | -------------------------------------------------------------------------- |
| Top-level routes | Owns namespaces (`/host`, `/remote`, `/remote-angular`, …)                 |
| Chrome           | Sidebar, tabs, chevrons, header — from modules + fetched remote `nav.json` |
| Auth UX          | Login / register + `RequireAuth` (UX only; API enforces real authz)        |
| HostBridge       | Theme, locale, session, navigation, telemetry for remotes                  |
| Remote Runtime   | `RemoteSlot` loads federation `./mount`, mounts into a DOM node, cleans up |
| Theme / i18n     | Dark/light + `en`/`ru`, pushed to remotes via the bridge                   |

## What a remote must provide

1. **Federation expose** — `./mount` implementing `MountRemoteApp` from `@platform/runtime-mf-contract`.
2. **Mount / unmount** — `mount({ container, bridge, basename })` → `{ unmount(), ready? }`. Prefer `ready` if bootstrap is async (e.g. Angular).
3. **Follow HostBridge** — theme, locale, auth, navigation from `bridge`; **never** read tokens from `localStorage` (use `bridge.auth.http.getAccessToken()`).
4. **Stay under basename** — interpret paths only under the shell-assigned prefix (e.g. `/remote/*`). Do not own top-level history when embedded.
5. **Optional `nav.json`** — pre-mount page list at `{origin}/nav.json` so the shell can render chrome without loading remote JS.

Contract package: `github:tryproxy/runtime-mf-contract` (`pnpm update @platform/runtime-mf-contract` to refresh).

---

## How mount works (short)

```text
Page → RemoteSlot → Remote Runtime → federation manifest → ./mount
                 → createHostBridge(theme, locale)
                 → mount({ container, bridge, basename })
                 → await ready? → show remote / error UI
```

`RemoteSlot` (`src/remote-runtime/ui/remote-slot.tsx`) is the React adapter: load timeout, bridge wiring, mount/unmount, loading & error UI. Remotes do not import it.

---

## Key files

| Path                                                | Why it matters                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/app/main.tsx` / `src/app/app.tsx`              | Boot + app composition                                                 |
| `src/app/routing/app-router.tsx`                    | React Router tree                                                      |
| `src/app/routing/build-module-routes.tsx`           | Module splat routes from nav config                                    |
| `src/app/routing/require-auth.tsx`                  | Auth guard for module areas                                            |
| `src/app/remote-navigation/nav-config.ts`           | Static modules; remote **pages** come from `nav.json`                  |
| `src/app/remote-navigation/*`                       | Fetch / validate / store remote nav manifests                          |
| `src/app/shell/app-shell.tsx`                       | Shell chrome (sidebar, tabs, header)                                   |
| `src/remote-runtime/ui/remote-slot.tsx`             | Mount lifecycle UI adapter                                             |
| `src/remote-runtime/lib/create-host-bridge.ts`      | HostBridge + history sync for embedded remotes                         |
| `src/pages/remote/` / `src/pages/remote-angular/`   | Thin pages that identify the remote rendered by `RemoteSlot`           |
| `src/app/remote-runtime/remote-runtime-adapters.ts` | Pure Module Federation runtime instance and static Phase 1 descriptors |
| `env.example`                                       | `VITE_*` URLs (API and federation manifests)                           |

---

## Local run

```bash
pnpm install
pnpm dev          # shell → :5000
```

Typical companions: Nest API ~`:3000`, React remote ~`:5001`, Angular remote ~`:5002` (`pnpm build && pnpm preview` for Angular federation). Copy `env.example` → `.env` as needed (`VITE_API_BASE_URL` must be the API host, not the shell).
