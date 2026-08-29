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

Already running servers are reused outside CI. To point at deployed origins
without starting Vite:

```bash
E2E_SKIP_WEBSERVER=1 \
E2E_SHELL_BASE_URL=https://shell.example.com \
E2E_ACCESS_TOKEN=... \
pnpm test:e2e
```

## Coordinates

Defaults target the current React demo remote. Override them to reuse the
suite against a temporarily registered starter later.

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

## Gaps

- Theme/locale tests assert route continuity, chrome survival, and that
  `RemoteRuntime.start()` is not called again. That is a shell session count,
  not a proof that React skipped an inner remount.
- Portal cleanup is proven with the demo Form page Select. Forced unmount of
  an open primitive uses `page.goto('/host')` while the listbox is open,
  because the demo has no dedicated “leave with overlay open” control.
