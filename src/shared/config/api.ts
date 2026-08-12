const DEFAULT_API_BASE_URL = 'http://localhost:3000';

/** Nest PoC API used by demo remotes and the commented shell Nest auth form. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, '');

/** ASO product API for shell-owned ASO email/password login. Set via env. */
export const ASO_API_BASE_URL = (
  import.meta.env.VITE_ASO_API_BASE_URL || ''
).replace(/\/+$/, '');
