# Runtime Microfrontend operator overview

For the maintained documentation routes, start at [Shell documentation](./README.md).

## Current cut

- Shell owns top-level routes, chrome, the Remote Runtime lifecycle, and HostBridge.
- A remote publishes Module Federation `./mount` and may publish `nav.json` for child navigation.
- The current Shell uses static remote descriptors; onboarding requires a Shell deployment.
- Contract: `@platform/runtime-mf-contract` `v0.5.4`; framework adapters: `v0.1.3`.
- Host E2E is owned by the Shell in [`e2e/`](../e2e/README.md), not copied into product remotes or the starter.

## Read only what applies

| Work                   | Document                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| New React remote       | [React remote starter `v0.1.0`](https://github.com/tryproxy/runtime-mf-react-remote-starter/tree/v0.1.0) |
| Existing React SPA     | [Existing-SPA guide](./guide/react-remote.md)                                                            |
| Register a remote      | [Shell registration](./guide/shell-registration.md)                                                      |
| Current platform state | [Current snapshot](./reserach.local/CURRENT.md)                                                          |
| External-team delivery | [Remote-team handoff](./reserach.local/tasks/remote-team-integration-handoff.md)                         |

The detailed research and production backlog are intentionally on-demand: [research router](./reserach.local/README.md).
