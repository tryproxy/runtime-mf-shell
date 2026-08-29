# Vite federation (React remote)

Detail for the producer config. Summary: [React remote guide](./react-remote.md) §5.

Example:
[`runtime-mf-module/vite.config.ts`](https://github.com/tryproxy/runtime-mf-module/blob/dev/vite.config.ts).

## Packages

```bash
npm install -D @module-federation/vite@^1.20.5
```

Keep React / ReactDOM remote-owned. `shared: {}` in federation config.

## Minimal plugin block

```ts
federation({
  name: 'store_admin', // federation producer name
  filename: 'remoteEntry.js',
  manifest: {
    additionalData: ({ stats }) => omitUnavailableSsrEntry(stats),
  },
  dts: false,
  shared: {},
  exposes: {
    './mount': './src/app/entry/index.ts',
  },
});
```

### `omitUnavailableSsrEntry`

Browser-only builds must not advertise a missing SSR entry in the manifest:

```ts
function omitUnavailableSsrEntry(stats: Record<string, unknown>) {
  const metaData = stats.metaData;
  if (typeof metaData !== 'object' || metaData === null) {
    return stats;
  }
  return {
    ...stats,
    metaData: Object.fromEntries(
      Object.entries(metaData).filter(([key]) => key !== 'ssrRemoteEntry')
    ),
  };
}
```

## Dev server

```ts
server: {
  origin: 'http://localhost:5003',
  port: 5003,
  strictPort: true,
  cors: true,
  hmr: false, // avoid React Refresh globals in a production shell host
},
preview: {
  port: 5003,
  strictPort: true,
  cors: true,
},
build: {
  target: 'esnext',
},
```

Use a free port (`5001` React demo, `5002` Angular, `5003` ASO, `5004` starter
are taken). Shell must be allowed by CORS.

## Do / don’t

| Do                                            | Don’t                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| Expose only `./mount` for the lifecycle       | Import standalone `main.tsx` into the expose graph                          |
| Import embedded CSS from mount only           | Enable `bundleAllCSS` blindly                                               |
| Register `rmfNavJson()` so `/nav.json` exists | Rely on SPA fallback for `mf-manifest.json` / `remoteEntry.js` / `nav.json` |

## After build / before shell wiring

Open and confirm JSON:

- `http://localhost:5003/mf-manifest.json`
- `http://localhost:5003/nav.json`

Same check on the deployed origin.
