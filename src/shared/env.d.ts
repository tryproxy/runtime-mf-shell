/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ASO_API_BASE_URL: string;
  readonly VITE_REMOTE_MANIFEST_URL: string;
  readonly VITE_ANGULAR_REMOTE_MANIFEST_URL: string;
  readonly VITE_ASO_REMOTE_MANIFEST_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
