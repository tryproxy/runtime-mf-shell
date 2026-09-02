# HostBridge for remotes

Detail for the host seam. Summary: [React remote guide](./react-remote.md) §7.

Contract pin: `github:tryproxy/runtime-mf-contract#v0.5.4`.

## What the shell passes into `mount`

```ts
mount({ container, bridge, basename }) → { unmount(), ready? }
```

| Input       | Meaning                                    |
| ----------- | ------------------------------------------ |
| `container` | DOM node owned by the shell slot           |
| `basename`  | Module namespace, e.g. `/store`            |
| `bridge`    | Theme, locale, auth, navigation, telemetry |

## Do / don’t

| Do                                                     | Don’t                                           |
| ------------------------------------------------------ | ----------------------------------------------- |
| Read theme / locale / session / location from `bridge` | Own shell chrome or top-level history           |
| Branch on `auth.http.mode`; request a bearer per call  | Read/write shell token in `localStorage`        |
| `bridge.auth.signOut()` for logout                     | Clear shell storage yourself                    |
| Stay under `basename`                                  | Register SW / web-push while embedded           |
| Scope CSS + portals to the mount root                  | Put product permission DTOs on the bridge       |
| Hide product sidebar/header when embedded              | Transplant Google/Telegram login into the shell |

## Auth

Shell owns login, storage, logout UX, and the credential policy for each
`remoteId`. Product login in the PoC shell is ASO email/password (plus optional
token paste). The `aso` remote currently receives that legacy ASO bearer;
unmapped remotes receive no credential (`getAccessToken()` resolves to `null`).
This policy is private Shell composition and does not change the HostBridge
contract or the login form.

Remote HTTP clients must tolerate a missing token and must not add an
`Authorization` header in that case. A new product gets a credential only after
the platform explicitly assigns an appropriate policy for its backend.

`bridge.auth.signOut()` clears the Shell-held session immediately. A legacy
backend logout notification is best-effort and cannot block navigation to the
Shell login page.

Optional ASO token handoff (shell strips the query after persist):

```text
https://<shell-host>/aso/login?access_token=<TOKEN>
https://<shell-host>/aso/login?access_token=<TOKEN>&returnTo=/aso
```

## Locale

`AppLocale` is `en | ru | es`. Follow `bridge.i18n`; do not override shell
locale while embedded.

## Lifecycle

Create API / query clients **per mount**. Dispose them on `unmount` (see ASO
[`mount.tsx`](https://github.com/asmarketr/aso-market-admin/blob/mf-remote-integraion/src/app/entry/mount.tsx)).
Leave/re-enter must not leak listeners, portals, or credentials.
