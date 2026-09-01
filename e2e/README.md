# Shell Playwright suite

Host-level Runtime MF browser tests. This integration suite and its Playwright
dependency are owned by `runtime-mf-shell`; product remotes and the React
starter do not copy it. `runtime-mf-module-angular` has a separate scaffolded
standalone Playwright smoke suite, which is not host-level Runtime MF evidence.

## Install browsers

```bash
pnpm playwright:install
```

Chromium only for this cut.

## Auth

The shell UX guard (`RequireAuth`) only checks `localStorage` for
`rmf-access-token`. On a **loopback** shell URL (`127.0.0.1`, `localhost`,
`::1`) with no protected-API mode, `pnpm test:e2e` pastes a dummy token
(`e2e-local`) on `/login`. That is not a real ASO credential and must not be
used against a deployed origin or a remote that performs protected API calls.

Explicit credentials are required when `E2E_SHELL_BASE_URL` is not loopback or
when `E2E_PROTECTED_API=1`. Partial pairs fail fast:

```bash
E2E_ACCESS_TOKEN=... pnpm test:e2e
E2E_EMAIL=... E2E_PASSWORD=... pnpm test:e2e
E2E_PROTECTED_API=1 E2E_ACCESS_TOKEN=... pnpm test:e2e
```

Auth storage is written to `playwright/.auth/` and is gitignored. Do not commit
tokens or `storageState`.

## Run

Start nothing yourself unless you want to. Playwright starts the shell
(`:5000`) and, when present, the sibling `runtime-mf-module` (`:5001`). When
`E2E_STARTER_SURFACE_URL` is set and the sibling starter exists, it also starts
that repository and waits on `E2E_STARTER_DEV_URL`.

```bash
pnpm typecheck:e2e
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:report
```

Run the optional starter profile directly against the standalone bug surface:

```bash
E2E_STARTER_SURFACE_URL=http://127.0.0.1:5004/#/patterns \
pnpm test:e2e -- e2e/runtime-mf/starter-standalone-polish.spec.ts
```

The same spec can run through a disposable embedded registration. Start the
temporary Shell with its React-demo federation entry pointed at the starter,
then use its assigned surface URL and set `E2E_STARTER_EMBEDDED=1`. This keeps
the permanent Shell catalog unchanged.

`pnpm lint` includes `typecheck:e2e`. UI mode has two Playwright projects:
`setup` (login) then `chromium` (the specs). Enable both in the Projects filter
or you only see `auth.setup.ts`.

Already running servers are reused outside CI. To point at deployed origins
without starting Vite:

```bash
E2E_SKIP_WEBSERVER=1 \
E2E_SHELL_BASE_URL=https://shell.example.com \
E2E_ACCESS_TOKEN=... \
pnpm test:e2e
```

## Coordinates

Defaults target the registered React demo. Retargeting (including a disposable
starter registration) is env/config only — do not edit spec files. The starter
exists as a sibling repository on `:5004` but is **not** a shell module.

| Variable                           | Default                                         |
| ---------------------------------- | ----------------------------------------------- |
| `E2E_SHELL_BASE_URL`               | `http://127.0.0.1:5000`                         |
| `E2E_REMOTE_DEV_URL`               | `http://127.0.0.1:5001`                         |
| `E2E_REMOTE_ID`                    | `remote`                                        |
| `E2E_REMOTE_PATH`                  | `/remote`                                       |
| `E2E_REMOTE_INDEX_PATH`            | `/remote`                                       |
| `E2E_REMOTE_CHILD_PATH`            | `/remote/details`                               |
| `E2E_REMOTE_CRASH_PATH`            | `/remote/crash`                                 |
| `E2E_REMOTE_FORM_PATH`             | `/remote/form`                                  |
| `E2E_REMOTE_READY_HEADING`         | `Remote module`                                 |
| `E2E_REMOTE_CHILD_HEADING`         | `Details`                                       |
| `E2E_REMOTE_INDEX_NAV_LABEL`       | `Overview`                                      |
| `E2E_REMOTE_CHILD_NAV_LABEL`       | `Details`                                       |
| `E2E_REMOTE_CRASH_CONTROL_LABEL`   | `Crash module render`                           |
| `E2E_REMOTE_CRASH_ERROR_TITLE`     | `Something went wrong in this module`           |
| `E2E_REMOTE_CRASH_ERROR_DETAIL`    | `PoC crash: intentional module render error`    |
| `E2E_REMOTE_FORM_SELECT_LABEL`     | `Team`                                          |
| `E2E_REMOTE_FORM_SELECT_OPTION`    | `Platform`                                      |
| `E2E_STARTER_SURFACE_URL`          | unset; standalone or disposable Shell URL       |
| `E2E_STARTER_DEV_URL`              | `http://127.0.0.1:5004`                         |
| `E2E_STARTER_EMBEDDED`             | unset; `1` waits for the configured remote slot |
| `E2E_STARTER_FORM_SELECT_LABEL`    | `Example state`                                 |
| `E2E_STARTER_COMPACT_SELECT_LABEL` | `Language`                                      |
| `E2E_STARTER_HINT_CONTROL_LABEL`   | `Show hint`                                     |
| `E2E_STARTER_HINT_TEXT`            | `Helpful context belongs close to the action.`  |
| `E2E_PROTECTED_API`                | unset (`1` requires explicit credentials)       |

Set `E2E_REMOTE_CRASH_PATH=` or `E2E_REMOTE_FORM_PATH=` (empty) to skip the
demo-only crash or portal surfaces.

Heading checks match the configured accessible name exactly but do not require
a particular `h1`/`h2`/`h3` level; semantic heading hierarchy is remote-owned.

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
| `data-rmf-slot-root`                     | mount container                             | Remote theme `data-rmf-theme` / `.dark`     |
| `data-rmf-shell="sidebar"` / `"header"`  | app chrome                                  | Shell chrome metric snapshots               |
| `window.__RMF_E2E__`                     | `src/remote-runtime/lib/e2e-observation.ts` | Count `RemoteRuntime.start()` per remote id |

The observation helper is a no-op unless a test installed `__RMF_E2E__` before
boot (the fixture does this and mirrors the count into `sessionStorage`).

## Gaps

- Theme/locale tests assert route continuity, chrome survival, remote mount-root
  theme attributes, and that `RemoteRuntime.start()` is not called again. That
  is a shell session count, not a proof that React skipped an inner remount.
- Portal cleanup is proven with the targeted Form page Select. Forced unmount of
  an open primitive uses `page.goto('/host')` while the listbox is open,
  because the demo has no dedicated “leave with overlay open” control.
- The optional starter profile now proves first-open Select alignment at
  desktop/compact widths and after resize/scroll, hover tooltip help without
  layout shift, and atomic page/card/input/Select/portal theme switching with
  normal and reduced motion.
- The profile accepts either the standalone URL or a disposable embedded Shell
  URL. Compact language-Select proof is standalone-only because embedded mode
  correctly omits the remote's local navigation chrome.
