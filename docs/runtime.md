# Runtime Microfrontend Guide

Brief operator guide for the current PoC. Deeper research lives in [`docs/reserach.local/`](./reserach.local/) — start with [POC-STATUS.md](./reserach.local/POC-STATUS.md).

## Repositories

| Repo                        | Role                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| `runtime-mf-shell`          | React host (layout, React Router, auth, Remote Runtime)                         |
| `runtime-mf-module`         | React remote (`runtime_mf_module`, alias `demo_remote`, port 5001)              |
| `runtime-mf-module-angular` | Angular remote (`runtime_mf_module_angular`, alias `angular_remote`, port 5002) |
| `runtime-mf-contract`       | `@platform/runtime-mf-contract` — types, runtime parsers and mock bridge        |

Install contract: `pnpm add 'github:tryproxy/runtime-mf-contract#v0.4.0'`. All current consumers use this immutable release tag.

## How it works

1. Shell creates a pure `@module-federation/enhanced` runtime instance.
2. Runtime reads each remote's `mf-manifest.json`, resolves `remoteEntry.js`, and loads exposed `./mount` (`demo_remote/mount` / `angular_remote/mount`).
3. Shell calls `mount({ container, bridge, basename })`.
4. Remote creates its own root (React or Angular), follows HostBridge for theme/locale/auth/nav, and returns `unmount()`.

## Important shell paths

| Concern                  | Path                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------ |
| App composition / router | `src/app/app.tsx`, `src/app/main.tsx`                                                |
| Nav data → routes        | `src/app/remote-navigation/nav-config.ts`, `src/app/routing/build-module-routes.tsx` |
| Auth guard               | `src/app/routing/require-auth.tsx`                                                   |
| Chrome                   | `src/app/shell/app-shell.tsx`                                                        |
| HostBridge               | `src/remote-runtime/lib/create-host-bridge.ts`                                       |
| Mount slot               | `src/remote-runtime/ui/remote-slot.tsx`                                              |
| Federation delivery      | `src/app/remote-runtime/remote-runtime-adapters.ts`                                  |

## Important remote paths

| Concern          | React module                   | Angular module             |
| ---------------- | ------------------------------ | -------------------------- |
| Mount expose     | `src/app/entry/mount.tsx`      | `src/app/entry/mount.ts`   |
| Embedded wrapper | `src/app/entry/remote-app.tsx` | bridge demo in Angular app |
| Standalone entry | `src/app/main.tsx`             | Vite standalone entry      |

## HostBridge (PoC)

Design C — every host store is `getSnapshot` + `subscribe`:

- `theme`, `i18n`, `auth` (+ `auth.http` bearer/`getAccessToken`), `navigation` (`navigate` / `replace`), `telemetry` (no-op)

Remotes must **not** read tokens from localStorage; use `bridge.auth.http.getAccessToken()`.

## Local run (typical)

- Nest API ~`:3000` — set `VITE_API_BASE_URL` to the API host (not the shell).
- Shell ~`:5000`, React remote ~`:5001`, Angular remote ~`:5002`; run `pnpm dev` in each frontend repository.
- Shell CORS origin must match without trailing slash.

## Auth (shell)

- Routes: `/login`, `/register`
- Test user shortcut: `user@mail.com` / `1Qwe-rty`
- `RequireAuth` wraps module routes (UX only; backend is the authz boundary)

## Further reading

- [POC-STATUS.md](./reserach.local/POC-STATUS.md) — what is ready
- [repository-map.md](./reserach.local/reference/repository-map.md) — FSD layout
- [runtime-contract.md](./reserach.local/architecture/runtime-contract.md) — contract surface
- [TODO.md](./reserach.local/TODO.md) — production backlog
