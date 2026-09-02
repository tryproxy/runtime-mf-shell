# Guides

Practical docs for connecting remotes to `runtime-mf-shell`.

**New React remote:** copy
[tryproxy/runtime-mf-react-remote-starter](https://github.com/tryproxy/runtime-mf-react-remote-starter)
and follow [its README](https://github.com/tryproxy/runtime-mf-react-remote-starter#readme)
(rename, HostBridge, hosting). Then register the copy in the shell:
[Shell registration](./shell-registration.md).

**Existing Vite + React SPA:** [React remote](./react-remote.md) — keep the
standalone app, add `./mount`, wire the shell. Example module: **Store**.

The other files zoom in on one step; they are not a second checklist. Do not
copy `runtime-mf-module` as a product skeleton (it is the demo/conformance
remote). The starter is not registered in this shell; there is no `/starter`
route until you onboard a copy.

| Doc                                                                                                              | What it is                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [React remote](./react-remote.md)                                                                                | Existing-SPA walkthrough: keep standalone app, add `./mount`, wire shell. Example module: **Store**.                                |
| [Embedded entry](./embedded-entry.md)                                                                            | Dual mode: `main.tsx` vs `./mount`, lifecycle, hide product chrome when embedded.                                                   |
| [CSS and tokens](./css-and-tokens.md)                                                                            | Shell `--rmf-*` tokens, embedded CSS, PostCSS scope, Tailwind notes.                                                                |
| [Starter style guide](https://github.com/tryproxy/runtime-mf-react-remote-starter/blob/main/docs/style-guide.md) | Maintained remote visual/ownership rules. Shell Lab at `/host/style-guide` is the Shell-owned chrome lab, not a copy of that guide. |
| [Vite federation](./vite-federation.md)                                                                          | Federation producer config, port/CORS, checking `/mf-manifest.json`.                                                                |
| [nav.json](./nav-json.md)                                                                                        | Child tabs for shell chrome: TS source, emit plugin, hosting.                                                                       |
| [HostBridge](./host-bridge.md)                                                                                   | Theme, locale, auth token, and what the remote must not own.                                                                        |
| [Shell registration](./shell-registration.md)                                                                    | Static shell files, env var, `RemoteSlot`, redeploy.                                                                                |
| [Deploy and host](./deploy-hosting.md)                                                                           | What to publish, CORS/cache/SPA traps, pointing the shell at the artifact.                                                          |
| [Shell Playwright](../../e2e/README.md)                                                                          | Shell-owned host-level e2e against the registered React demo and optional starter profile.                                          |

Reference repos:

- Shell: [tryproxy/runtime-mf-shell](https://github.com/tryproxy/runtime-mf-shell) (`dev`)
- React demo remote: [tryproxy/runtime-mf-module](https://github.com/tryproxy/runtime-mf-module) (`dev`)
- React starter (greenfield React remote): [tryproxy/runtime-mf-react-remote-starter](https://github.com/tryproxy/runtime-mf-react-remote-starter)
- Product remote (ASO): [asmarketr/aso-market-admin](https://github.com/asmarketr/aso-market-admin) (`mf-remote-integraion`)
