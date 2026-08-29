# Shell Playwright suite

Host-level Runtime MF browser tests. Playwright is installed only in
`runtime-mf-shell`. Product remotes and the React starter do not get their own
Playwright dependency.

## Install browsers

```bash
pnpm playwright:install
```

Chromium only for this cut.

## Auth

The shell UX guard (`RequireAuth`) only checks `localStorage` for
`rmf-access-token`. `pnpm test:e2e` pastes a dummy token (`e2e-local`) on
`/login`. That is not a real ASO credential.

Override only when you need a real session:

```bash
E2E_ACCESS_TOKEN=... pnpm test:e2e
E2E_EMAIL=... E2E_PASSWORD=... pnpm test:e2e
```

Auth storage is written to `playwright/.auth/` and is gitignored.

## Run

Start nothing yourself unless you want to. Playwright starts the shell
(`:5000`) and, when present, the sibling `runtime-mf-module` (`:5001`).

```bash
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
```

UI mode has two Playwright projects: `setup` (login) then `chromium` (the
specs). Enable both in the Projects filter or you only see `auth.setup.ts`.

Already running servers are reused outside CI. To point at deployed origins
without starting Vite:

```bash
E2E_SKIP_WEBSERVER=1 \
E2E_SHELL_BASE_URL=https://shell.example.com \
E2E_ACCESS_TOKEN=... \
pnpm test:e2e
```

## Coordinates

Defaults target the registered React demo. The starter exists as a sibling
repository on `:5004` but is **not** a shell module. Coordinate overrides
only work after a temporary registration (and with `E2E_SKIP_WEBSERVER=1` as
below).

| Variable                     | Default                 |
| ---------------------------- | ----------------------- |
| `E2E_SHELL_BASE_URL`         | `http://127.0.0.1:5000` |
| `E2E_REMOTE_DEV_URL`         | `http://127.0.0.1:5001` |
| `E2E_REMOTE_ID`              | `remote`                |
| `E2E_REMOTE_PATH`            | `/remote`               |
| `E2E_REMOTE_INDEX_PATH`      | `/remote`               |
| `E2E_REMOTE_CHILD_PATH`      | `/remote/details`       |
| `E2E_REMOTE_CRASH_PATH`      | `/remote/crash`         |
| `E2E_REMOTE_FORM_PATH`       | `/remote/form`          |
| `E2E_REMOTE_READY_HEADING`   | `Remote module`         |
| `E2E_REMOTE_CHILD_HEADING`   | `Details`               |
| `E2E_REMOTE_INDEX_NAV_LABEL` | `Overview`              |
| `E2E_REMOTE_CHILD_NAV_LABEL` | `Details`               |

Set `E2E_REMOTE_CRASH_PATH=` or `E2E_REMOTE_FORM_PATH=` (empty) to skip the
demo-only crash or portal surfaces.

`pnpm test:e2e` auto-starts the shell and, when
`../runtime-mf-module/package.json` exists, that demo on **its** Vite port
(`:5001`). `E2E_REMOTE_DEV_URL` only changes the URL Playwright waits on; it
does not retarget the webServer cwd. To reuse the suite against a temporarily
registered starter (`:5004`) or any other remote: start shell and that remote
yourself, then set `E2E_SKIP_WEBSERVER=1` plus the coordinate overrides.

The starter is not registered in the shell. Overriding paths without a
temporary onboarding change will not open `/starter`.

## Locators and probes

Production UI does not depend on these. Tests do:

| Seam                                     | Where                                       | Role                                        |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------- |
| `data-rmf-slot` / `data-rmf-slot-status` | `RemoteSlot`                                | Wait until that remote is `ready`           |
| `data-rmf-shell="sidebar"` / `"header"`  | app chrome                                  | Chrome metric snapshots                     |
| `window.__RMF_E2E__`                     | `src/remote-runtime/lib/e2e-observation.ts` | Count `RemoteRuntime.start()` per remote id |

The observation helper is a no-op unless a test installed `__RMF_E2E__` before
boot (the fixture does this and mirrors the count into `sessionStorage`).

## Gaps

- Theme/locale tests assert route continuity, chrome survival, and that
  `RemoteRuntime.start()` is not called again. That is a shell session count,
  not a proof that React skipped an inner remount.
- Portal cleanup is proven with the demo Form page Select. Forced unmount of
  an open primitive uses `page.goto('/host')` while the listbox is open,
  because the demo has no dedicated “leave with overlay open” control.
