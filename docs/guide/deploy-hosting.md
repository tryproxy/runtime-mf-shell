# Deploy and host the remote artifact

Detail for publishing federation files the shell can load. Summary:
[React remote guide](./react-remote.md) §10.

A **new** remote also needs [shell registration](./shell-registration.md) and a
shell redeploy. A **new version** of an already registered remote only needs a
new artifact at the same manifest URL (then verify; shell rebuild only if the
env URL changes).

## What the origin must serve

Real files (not HTML fallbacks):

```text
mf-manifest.json
remoteEntry.js
nav.json
exposed mount chunk
referenced JS chunks
CSS, fonts, images, other assets
```

Open these in a browser **before** pointing the shell at them:

```text
https://<remote-origin>/mf-manifest.json
https://<remote-origin>/nav.json
```

Both must be JSON. Manifest `name` must match the reserved federation name;
expose must include `./mount`; referenced paths must exist.

## SPA hosting pitfalls

Many hosts rewrite unknown paths to `index.html`. That breaks federation if
`mf-manifest.json`, `remoteEntry.js`, or `nav.json` return HTML.

Fix: explicit static rules / headers so those paths stay JSON/JS.

## CORS

The **browser** loads the remote from the shell origin. Allow the shell origin
to read the manifest, entry, chunks, CSS, fonts, and `nav.json`.

Prefer the exact shell origin (no trailing slash) when the host only allows a
single `Access-Control-Allow-Origin`.

## Caching

| File                                             | Policy                                  |
| ------------------------------------------------ | --------------------------------------- |
| `mf-manifest.json`, `remoteEntry.js`, `nav.json` | Revalidate or `no-cache` (stable names) |
| Hashed chunks / CSS / fonts / images             | Long-lived immutable                    |

## Shell env after deploy

```dotenv
VITE_STORE_REMOTE_MANIFEST_URL=https://store.example.com/mf-manifest.json
```

Set this in the **shell** hosting environment and **redeploy the shell**. Vite
bakes `VITE_*` at build time — changing only the remote host is not enough if
the shell still points elsewhere.

Local shell → local or public remote URL. Deployed shell → **public** remote
URL only (laptop `:5003` is unreachable from Vercel).

## Preview vs production (product pattern)

Typical product flow (e.g. ASO):

1. Host a preview channel / preview stand with federation artifacts.
2. Point shell preview (or a dedicated shell env) at
   `VITE_*_REMOTE_MANIFEST_URL` for that preview origin.
3. Browser-proof mount, nav, auth, leave/re-enter.
4. Promote remote to production origin; update shell env; redeploy shell.
5. Revert any temporary preview-only API stands when the pilot is done.

## Related

- [Vite federation](./vite-federation.md) — local produce / inspect
- [Shell registration](./shell-registration.md) — static onboarding
- [nav.json](./nav-json.md) — same-origin emit and hosting
