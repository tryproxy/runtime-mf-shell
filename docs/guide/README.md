# Guides

Practical docs for connecting remotes to `runtime-mf-shell`.

**Start here:** [React remote](./react-remote.md) — the full step-by-step path.
The other files zoom in on one step; they are not a second checklist.

| Doc                                                                                                              | What it is                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [React remote](./react-remote.md)                                                                                | Main walkthrough: keep standalone app, add `./mount`, wire shell. Example module: **Store** (rename as needed). |
| [Embedded entry](./embedded-entry.md)                                                                            | Dual mode: `main.tsx` vs `./mount`, lifecycle, hide product chrome when embedded.                               |
| [CSS and tokens](./css-and-tokens.md)                                                                            | Shell `--rmf-*` tokens, embedded CSS, PostCSS scope, Tailwind notes.                                            |
| [Starter style guide](https://github.com/tryproxy/runtime-mf-react-remote-starter/blob/main/docs/style-guide.md) | Starter visual, responsive, primitive, accessibility, and UI code rules.                                        |
| [Vite federation](./vite-federation.md)                                                                          | Federation producer config, port/CORS, checking `/mf-manifest.json`.                                            |
| [nav.json](./nav-json.md)                                                                                        | Child tabs for shell chrome: TS source, emit plugin, hosting.                                                   |
| [HostBridge](./host-bridge.md)                                                                                   | Theme, locale, auth token, and what the remote must not own.                                                    |
| [Shell registration](./shell-registration.md)                                                                    | Static shell files, env var, `RemoteSlot`, redeploy.                                                            |
| [Deploy and host](./deploy-hosting.md)                                                                           | What to publish, CORS/cache/SPA traps, pointing the shell at the artifact.                                      |
| [Shell Playwright](../../e2e/README.md)                                                                          | Host-level e2e in the shell only. `pnpm test:e2e` against the registered React demo.                            |

Reference repos:

- Shell: [tryproxy/runtime-mf-shell](https://github.com/tryproxy/runtime-mf-shell) (`dev`)
- React demo remote: [tryproxy/runtime-mf-module](https://github.com/tryproxy/runtime-mf-module) (`dev`)
- React starter (baseline copy, not a published template): [tryproxy/runtime-mf-react-remote-starter](https://github.com/tryproxy/runtime-mf-react-remote-starter)
- Product remote (ASO): [asmarketr/aso-market-admin](https://github.com/asmarketr/aso-market-admin) (`mf-remote-integraion`)

Greenfield onboarding still follows this guide until the starter's publication
gates close. The starter has dropped demo pages and passed its embedded
CSS/portal plus UI-hardening proof, but hosting/CI/rename/compatibility and
maintenance work still block **Use this template** status. Existing-SPA
adaptation remains a separate supported path.
