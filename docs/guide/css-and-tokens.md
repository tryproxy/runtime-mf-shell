# CSS and tokens

Detail for remotes that share the shell document. Summary path:
[React remote guide](./react-remote.md) §6.

## Ownership

```text
shell selects light / dark
  → html[data-rmf-theme] + .dark + --rmf-* variables
    → remote maps tokens into its own CSS / Tailwind
```

- Shell owns document theme and paint tokens.
- Remotes **consume** `var(--rmf-*)` — they do not import shell Tailwind CSS.
- Product colors stay in the remote; provide standalone fallbacks when `--rmf-*`
  are missing.

Source of truth:
[`runtime-mf-shell/src/shared/styles/tokens.css`](https://github.com/tryproxy/runtime-mf-shell/blob/dev/src/shared/styles/tokens.css).

## Tokens (PoC)

| Token                 | Meaning                  |
| --------------------- | ------------------------ |
| `--rmf-color-page`    | Page / canvas background |
| `--rmf-color-surface` | Card / panel surface     |
| `--rmf-color-fg`      | Primary text             |
| `--rmf-color-muted`   | Secondary text           |
| `--rmf-color-subtle`  | Tertiary / label text    |
| `--rmf-color-border`  | Borders                  |
| `--rmf-radius-md`     | Medium radius            |
| `--rmf-shadow-sm`     | Light elevation          |

Names are a PoC convention, not a frozen public API yet.

## Theme from HostBridge

Use `bridge.theme` (`getSnapshot` / `subscribe`). The shell sets
`html[data-rmf-theme]` and the shadcn `.dark` class. Embedded remotes should
not fight document theme by writing their own `html` / `body` background.

## Embedded stylesheet

Keep standalone CSS on `main.tsx`. Federation `./mount` imports a **second**
file only, e.g. `embedded-style.css`.

1. Set a data attribute on the shell container in `mount`
   (`data-store-embedded` / ASO `data-aso-embedded`).
2. Scope CSS to `[data-store-embedded]` (attribute selector).
3. Prefer content height + `overscroll-behavior: contain` — shell owns page
   scroll when embedded.

Example:
[ASO `embedded-style.css`](https://github.com/asmarketr/aso-market-admin/blob/mf-remote-integraion/src/app/embedded-style.css).

```css
/* embedded-style.css */
[data-store-embedded] {
  min-height: 0;
  overflow: visible;
  overscroll-behavior: contain;
}
```

## PostCSS scope (required with Tailwind preflight)

Unscoped preflight restyles shell chrome. Copy ASO’s plugin and run it **only**
on the embedded stylesheet:

- Plugin: [`postcss-embedded-style-scope.js`](https://github.com/asmarketr/aso-market-admin/blob/mf-remote-integraion/postcss-embedded-style-scope.js)
- Wire-up: [`postcss.config.js`](https://github.com/asmarketr/aso-market-admin/blob/mf-remote-integraion/postcss.config.js)

```js
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { embeddedStyleScope } from './postcss-embedded-style-scope.js';

export default {
  plugins: [tailwindcss(), autoprefixer(), embeddedStyleScope()],
};
```

The plugin prefixes selectors with the mount root and rewrites `:root` / `html`
/ `body` / `*` onto that root. Standalone CSS is untouched.

Also: portals (dialogs, toasts, selects) inside the mount root; no service
worker from the embedded entry; hide product sidebar/header when embedded.

## Tailwind version

| Path                                                   | Version                   |
| ------------------------------------------------------ | ------------------------- |
| Product remotes (PostCSS + classic Tailwind), e.g. ASO | **`^3.4`** — preferred    |
| Demo React remote / shell (`@tailwindcss/vite`)        | **v4** — greenfield demos |

Do not mix v3 PostCSS assumptions with v4’s Vite plugin casually.

## Demo remote CSS layer (optional)

The React demo wraps emitted CSS in `@layer rmf-remote` via
[`vite-plugin-rmf-remote-css-layer.ts`](https://github.com/tryproxy/runtime-mf-module/blob/dev/vite-plugin-rmf-remote-css-layer.ts).
Useful for utility collision reduction; **not** a substitute for selector
scoping on a product stylesheet with preflight.

## Breakpoints (shell)

| Name         |               Min | Notes                      |
| ------------ | ----------------: | -------------------------- |
| compact      |             500px | `--breakpoint-compact`     |
| comfortable  |             560px | `--breakpoint-comfortable` |
| sm           |             640px | Tailwind default           |
| wideMobile   |             740px | `--breakpoint-wideMobile`  |
| md / lg / xl | 768 / 1024 / 1280 | Tailwind defaults          |

Defined in shell
[`breakpoints.ts`](https://github.com/tryproxy/runtime-mf-shell/blob/dev/src/shared/config/breakpoints.ts)
and mirrored in `tokens.css`. No shared released breakpoint package yet.

## Verify

1. Build remote; load under shell.
2. Toggle shell theme/locale without remounting.
3. Shell chrome stays stable after remote CSS loads.
4. Exercise portaled UI; leave/re-enter; no duplicate style links or stale
   document state.

For the registered React demo, the shell Playwright suite covers mount,
theme/locale chrome survival, and a portaled Select open/close plus forced
unmount (`pnpm test:e2e`). It does not replace product-remote scoping proof.
