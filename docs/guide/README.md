# Guides

Practical docs for connecting remotes to `runtime-mf-shell`.

**Start here:** [React remote](./react-remote.md) — the full step-by-step path.
The other files zoom in on one step; they are not a second checklist.

| Doc                                           | What it is                                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [React remote](./react-remote.md)             | Main walkthrough: keep standalone app, add `./mount`, wire shell. Example module: **Store** (rename as needed). |
| [Embedded entry](./embedded-entry.md)         | Dual mode: `main.tsx` vs `./mount`, lifecycle, hide product chrome when embedded.                               |
| [CSS and tokens](./css-and-tokens.md)         | Shell `--rmf-*` tokens, embedded CSS, PostCSS scope, Tailwind notes.                                            |
| [Vite federation](./vite-federation.md)       | Federation producer config, port/CORS, checking `/mf-manifest.json`.                                            |
| [nav.json](./nav-json.md)                     | Child tabs for shell chrome: TS source, emit plugin, hosting.                                                   |
| [HostBridge](./host-bridge.md)                | Theme, locale, auth token, and what the remote must not own.                                                    |
| [Shell registration](./shell-registration.md) | Static shell files, env var, `RemoteSlot`, redeploy.                                                            |
| [Deploy and host](./deploy-hosting.md)        | What to publish, CORS/cache/SPA traps, pointing the shell at the artifact.                                      |

Reference repos:

- Shell: [tryproxy/runtime-mf-shell](https://github.com/tryproxy/runtime-mf-shell) (`dev`)
- React demo remote: [tryproxy/runtime-mf-module](https://github.com/tryproxy/runtime-mf-module) (`dev`)
- Product remote (ASO): [asmarketr/aso-market-admin](https://github.com/asmarketr/aso-market-admin) (`mf-remote-integraion`)
