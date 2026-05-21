import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
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
        demo_remote: 'http://localhost:5001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
    {
      name: 'fix-federation-dev-share-scope',
      enforce: 'post',
      transform(code, id) {
        if (!id.includes('__federation__')) {
          return null;
        }

        if (!code.includes('__rf_placeholder__shareScope')) {
          return null;
        }

        return code.replace(
          /const wrapShareScope = remoteFrom => \{\s+return \{\s+__rf_placeholder__shareScope\s+\}\s+\}/m,
          `const wrapShareScope = remoteFrom => {
  return {}
}`
        );
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
});
