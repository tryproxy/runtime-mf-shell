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
- Common primitives use the shared semantic roles. Product/domain colors stay
  in the remote.
- A remote provides its own standalone fallbacks when `--rmf-*` are missing.

The canonical names and optional Tailwind v4 adapter are published by
`@platform/runtime-mf-contract/design-tokens`. The Shell values are mapped in
[`src/shared/styles/tokens.css`](../../src/shared/styles/tokens.css).

## Design Tokens v1

| Token                      | Purpose                            |
| -------------------------- | ---------------------------------- |
| `--rmf-color-page`         | Page/canvas background             |
| `--rmf-color-fg`           | Default page text                  |
| `--rmf-color-surface`      | Card, panel, popover background    |
| `--rmf-color-surface-fg`   | Text on a surface                  |
| `--rmf-color-muted`        | Muted/secondary background         |
| `--rmf-color-muted-fg`     | Secondary text and labels          |
| `--rmf-color-primary`      | Primary action                     |
| `--rmf-color-primary-fg`   | Text/icon on primary               |
| `--rmf-color-secondary`    | Secondary action                   |
| `--rmf-color-secondary-fg` | Text/icon on secondary             |
| `--rmf-color-accent`       | Ghost/interactive hover background |
| `--rmf-color-accent-fg`    | Text/icon on accent                |
| `--rmf-color-destructive`  | Error and destructive action       |
| `--rmf-color-border`       | Dividers and structural borders    |
| `--rmf-color-input`        | Form-control chrome                |
| `--rmf-color-ring`         | Keyboard focus ring                |
| `--rmf-radius-md`          | Base control radius                |
| `--rmf-shadow-sm`          | Light elevation                    |
| `--rmf-font-sans`          | Shared sans-serif font stack       |

The interface intentionally excludes shell sidebar/chart roles, spacing, and
breakpoints. Remotes derive their smaller/larger radii from the single base
radius and keep business-state colors local.

Tailwind v4 remotes may import the adapter:

```css
@import '@platform/runtime-mf-contract/design-tokens/tailwind-v4.css';
```

This adds `rmf-*` utilities; it does not publish values or set a theme.

## Theme from HostBridge

Use `bridge.theme` (`getSnapshot` / `subscribe`). The shell sets
`html[data-rmf-theme]` and the shadcn `.dark` class. Embedded remotes should
not fight document theme by writing their own `html` / `body` background.

Treat a theme change as one visual transaction. Page surfaces, cards, form
controls, and overlays should reach the target semantic-token state in the same
paint. Avoid broad `transition-all` or `transition-colors` rules that delay
semantic color changes during the global switch; keep hover/focus motion
separate and honor `prefers-reduced-motion`.

The React starter is the reference consumer: it maps the shared roles at its
mount boundary and keeps semantic controls/overlays free of broad color/all
transitions.

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

| Path                                                   | Version                                                                          |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Product remotes (PostCSS + classic Tailwind), e.g. ASO | **`^3.4`** — preferred                                                           |
| Demo React remote / shell (`@tailwindcss/vite`)        | **v4**                                                                           |
| React starter (copy lineage, separate embedded graph)  | **v4** — embedded graph omits Preflight/document globals and is artifact-checked |

Do not mix v3 PostCSS assumptions with v4’s Vite plugin casually.

## Demo remote CSS layer (optional)

The React demo wraps emitted CSS in `@layer rmf-remote` via
[`vite-plugin-rmf-remote-css-layer.ts`](https://github.com/tryproxy/runtime-mf-module/blob/dev/vite-plugin-rmf-remote-css-layer.ts).
Useful for utility collision reduction; **not** a substitute for selector
scoping on a product stylesheet with preflight.

## Breakpoints and responsive ownership

| Name        | Minimum | Notes                      |
| ----------- | ------: | -------------------------- |
| compact     |   500px | `--breakpoint-compact`     |
| comfortable |   560px | `--breakpoint-comfortable` |
| sm          |   640px | Tailwind default           |
| wideMobile  |   740px | `--breakpoint-wideMobile`  |
| md          |   768px | Tailwind default           |
| lg          |  1024px | Tailwind default           |
| xl          |  1280px | Tailwind default           |
| 2xl         |  1536px | Tailwind default           |

Defined in shell
[`breakpoints.ts`](https://github.com/tryproxy/runtime-mf-shell/blob/dev/src/shared/config/breakpoints.ts)
and mirrored in `tokens.css`. ASO currently keeps equivalent product-owned
values. The React starter no longer copies the Shell-specific custom scale. No
shared released breakpoint package or drift check exists yet.

The 2026-09-01 starter policy is implemented: its unused custom `px` copies are
removed, Tailwind defaults remain, and viewport ownership stays local to
Shell/product remotes. Runtime MF Contract does not publish breakpoints.

For embedded page composition, prefer container queries because the remote slot
can be narrow while the browser viewport is wide. The starter neutral pages use
`@2xl/page` (42rem), `@3xl/page` (48rem), and `@5xl/page` (64rem). Viewport
breakpoints remain appropriate only for behavior that truly depends on the
browser viewport.

## Primitive behavior

- A Select listbox must align to its trigger on its first open and after
  trigger/content resize or ancestor scrolling. Calculate alignment from the
  final rendered width.
- Tooltip is hover/focus supplementary help and must not insert an inline
  block that shifts surrounding controls. Persistent tap/click help, when a
  product needs it, should use a disclosure, Popover, or inline region.
- Keep component files component-only for React Fast Refresh. Move hooks,
  contexts, constants, and variant definitions to adjacent `.ts` modules rather
  than disabling `react-refresh/only-export-components`.

## Verify

1. Build remote; load under shell.
2. Toggle shell theme/locale without a new shell mount session.
3. Shell chrome stays stable after remote CSS loads.
4. Exercise portaled UI; leave/re-enter; no duplicate style links or stale
   document state.
5. Open each Select once and verify its listbox is aligned before any reopen.
6. Hover “Show hint” and confirm the tooltip does not shift the actions row.
7. On a control-heavy page, check the theme switch boundary for mixed old/new
   semantic colors and repeat with reduced motion enabled.

For the registered React demo, the shell Playwright suite covers mount,
theme/locale chrome survival, and a portaled Select open/close plus forced
unmount (`pnpm test:e2e`). It does not replace product-remote scoping proof.
