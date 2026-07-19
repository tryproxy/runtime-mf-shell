import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const remoteEntryUrl =
    env.VITE_REMOTE_ENTRY_URL || 'http://localhost:5001/assets/remoteEntry.js';

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler', { target: '19' }]],
        },
      }),
      tailwindcss(),
      viteTsconfigPaths(),
      svgr({
        include: '**/*.svg?react',
      }),
      federation({
        name: 'runtime_mf_shell',
        remotes: {
          demo_remote: remoteEntryUrl,
        },
        shared: ['react', 'react-dom'],
      }),
      {
        name: 'fix-federation-share-scope-placeholder',
        enforce: 'post',
        transform(code, id) {
          if (
            !id.includes('__federation__') ||
            !code.includes('__rf_placeholder__shareScope')
          ) {
            return null;
          }

          // Bare identifier left by originjs when share rewrite fails.
          return code.replaceAll('__rf_placeholder__shareScope', '');
        },
        generateBundle(_options, bundle) {
          for (const file of Object.values(bundle)) {
            if (file.type !== 'chunk') {
              continue;
            }

            if (!file.code.includes('__rf_placeholder__shareScope')) {
              continue;
            }

            file.code = file.code.replaceAll(
              '__rf_placeholder__shareScope',
              ''
            );
          }
        },
      },
    ],
    server: {
      port: 5000,
      strictPort: true,
    },
    build: {
      target: 'esnext',
    },
  };
});
