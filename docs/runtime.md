# Runtime Microfrontend Guide

Brief operator guide for the current PoC. Deeper research lives in [`docs/reserach.local/`](./reserach.local/) — start with [POC-STATUS.md](./reserach.local/POC-STATUS.md).

**Connect a React product remote:** [guide/react-remote.md](./guide/react-remote.md)
([guide index](./guide/README.md)).

## Repositories

| Repo                              | Role                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `runtime-mf-shell`                | React host (layout, React Router, auth, Remote Runtime, host Playwright)                          |
| `runtime-mf-module`               | React demo remote (`runtime_mf_module`, alias `demo_remote`, port 5001)                           |
| `runtime-mf-module-angular`       | Angular remote (`runtime_mf_module_angular`, alias `angular_remote`, port 5002)                   |
| `runtime-mf-react-remote-starter` | Neutralized React template copy (`starter`, port 5004). Not registered; not a published template. |
| `runtime-mf-contract`             | `@platform/runtime-mf-contract` — types, runtime parsers and mock bridge                          |
| `runtime-mf-adapters`             | `@platform/runtime-mf-adapters` — React and Angular lifecycle implementations                     |

Install contract: `pnpm add 'github:tryproxy/runtime-mf-contract#v0.5.2'`.
The shell and all current remotes pin this release, including its shell-owned
`bridge.auth.signOut()` capability.

Install framework adapters: `pnpm add 'github:tryproxy/runtime-mf-adapters#v0.1.2'`. React and Angular remotes pin this release; each still supplies its own framework runtime.

## Current delivery state

The lifecycle foundation, Module Federation migration, and static production delivery proof are complete. The shell still registers known remotes statically; runtime discovery and the Composition Catalog are deferred until runtime onboarding is needed.

The deployed shell now loads production-hosted React and Angular artifacts through those static descriptors. Direct deep links and contained remote failure have been manually verified.

A representative standalone product SPA has completed its application,
embedded-bridge adaptation, and federation producer configuration. Its next
proof is loading the preview artifact through the deployed shell; visual
containment follows only from observed browser conflicts.

## How it works

1. Shell creates a pure `@module-federation/enhanced` runtime instance.
2. Runtime reads each remote's `mf-manifest.json`, resolves `remoteEntry.js`, and loads exposed `./mount` (`demo_remote/mount` / `angular_remote/mount`).
3. Shell calls `mount({ container, bridge, basename })`.
4. The selected framework adapter creates the React root or Angular application and returns `ready` plus idempotent `unmount()`.
5. The remote's thin mount composition supplies product UI, providers, routing, HostBridge integration, styles, and standalone-specific policy.

## Important shell paths

| Concern                  | Path                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------ |
| App composition / router | `src/app/app.tsx`, `src/app/main.tsx`                                                |
| Nav data → routes        | `src/app/remote-navigation/nav-config.ts`, `src/app/routing/build-module-routes.tsx` |
| Nav.json sources         | `src/app/remote-navigation/remote-nav-sources.ts`                                    |
| Auth guard               | `src/app/routing/require-auth.tsx`                                                   |
| Chrome                   | `src/app/shell/app-shell.tsx`                                                        |
| HostBridge               | `src/remote-runtime/lib/create-host-bridge.ts`                                       |
| Mount slot               | `src/remote-runtime/ui/remote-slot.tsx`                                              |
| Federation composition   | `src/app/remote-runtime/remote-runtime-composition.ts`                               |
| Host Playwright suite    | `e2e/`, `playwright.config.ts` — see [`e2e/README.md`](../e2e/README.md)             |

## Important remote paths

| Concern             | React module                   | Angular module                     |
| ------------------- | ------------------------------ | ---------------------------------- |
| Public `./mount`    | `src/app/entry/index.ts`       | `src/app/entry/index.ts`           |
| Product composition | `src/app/entry/mount.tsx`      | `src/app/entry/mount.ts`           |
| Embedded root       | `src/app/entry/remote-app.tsx` | `src/app/entry/remote-root.ts`     |
| Framework lifecycle | adapters package `/react`      | adapters package `/angular`        |
| Standalone entry    | `src/app/main.tsx`             | `src/vite-main.ts` / `src/main.ts` |

## HostBridge (PoC)

Design C — every host store is `getSnapshot` + `subscribe`:

- `theme`, `i18n`, `auth` (`auth.http` plus, in contract `v0.5.0`, `signOut()`), `navigation` (`navigate` / `replace`), `telemetry` (no-op)

Remotes must **not** read tokens from localStorage; use `bridge.auth.http.getAccessToken()`.

`bridge.auth.signOut()` is the remote request for shell sign-out. The shell,
not the remote, clears its session and redirects to `/login`.

## Local run (typical)

- Nest API ~`:3000` — set `VITE_API_BASE_URL` to the API host (not the shell).
- Shell ~`:5000`, React demo ~`:5001`, Angular ~`:5002`; ASO (if running) ~`:5003`.
- React starter ~`:5004` when working on that repository. The shell does not
  register it; do not expect `/starter` until a temporary onboarding change.
- Run `pnpm dev` in each frontend repository you need. Shell CORS origin must
  match without trailing slash.

Running each remote with `pnpm dev` is sufficient for local shell development. A production or preview shell must instead point to deployed production artifacts; it must not depend on a remote development server.

## Browser tests

Host-level Runtime MF checks live in the shell only (`e2e/`). Do not add
Playwright to remotes or the React starter. First time on a machine:

```bash
pnpm playwright:install
pnpm typecheck:e2e
pnpm test:e2e
```

The suite starts (or reuses) the shell on `:5000` and the React demo on
`:5001`, signs in (dummy `e2e-local` only on loopback UI-guard runs), and
exercises the registered `/remote` module. Operator detail:
[`e2e/README.md`](../e2e/README.md).

UI mode (`pnpm test:e2e:ui`) has two Playwright projects: `setup` (login) and
`chromium` (the specs). Enable both in the Projects filter or you will only
see `auth.setup.ts`.

## Static remote configuration

The current shell reads build-time variables for each registered remote:

```dotenv
VITE_REMOTE_MANIFEST_URL=https://runtime-mf-module.vercel.app/mf-manifest.json
VITE_ANGULAR_REMOTE_MANIFEST_URL=https://runtime-mf-module-angular.vercel.app/mf-manifest.json
# Unset falls back to http://localhost:5003/mf-manifest.json
VITE_ASO_REMOTE_MANIFEST_URL=https://<aso-host>/mf-manifest.json
```

There is no `VITE_STARTER_REMOTE_MANIFEST_URL` until someone registers that
remote. Set the variables that exist in the shell deployment environment and
redeploy the shell. Each remote origin must serve `mf-manifest.json`,
`remoteEntry.js`, referenced chunks, CSS, fonts, assets, and the current PoC
`nav.json`, with the shell origin allowed by CORS.

The shell currently derives `nav.json` from each federation-manifest origin. This is PoC behavior, not the future artifact/registry contract.

## Auth (shell)

- Routes: `/login`, `/register`
- Test user shortcut: `user@mail.com` / `1Qwe-rty`
- `RequireAuth` wraps module routes (UX only; backend is the authz boundary)

## Further reading

- [guide/react-remote.md](./guide/react-remote.md) — connect a Vite + React product remote ([index](./guide/README.md))
- [e2e/README.md](../e2e/README.md) — host Playwright suite
- [React remote starter task](./reserach.local/tasks/react-remote-starter.md) — in-progress template
- [POC-STATUS.md](./reserach.local/POC-STATUS.md) — what is ready
- [phases.md](./reserach.local/phases.md) — active delivery sequence
- [repository-map.md](./reserach.local/reference/repository-map.md) — FSD layout
- [runtime-contract.md](./reserach.local/architecture/runtime-contract.md) — contract surface
- [TODO.md](./reserach.local/TODO.md) — production backlog
