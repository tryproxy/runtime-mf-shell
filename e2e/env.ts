import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const shellRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export const AUTH_STATE_PATH = path.join(
  shellRoot,
  'playwright/.auth/user.json'
);

export const DEMO_REMOTE_ROOT = path.resolve(shellRoot, '../runtime-mf-module');

declare global {
  interface Window {
    __RMF_E2E__?: { sessionStarts: Record<string, number> };
  }
}

export type E2eAuth =
  | { kind: 'token'; token: string }
  | { kind: 'password'; email: string; password: string };

export type E2eTarget = {
  shellBaseUrl: string;
  remoteDevUrl: string;
  remoteId: string;
  remotePath: string;
  indexPath: string;
  childPath: string;
  crashPath: string | null;
  formPath: string | null;
  readyHeading: string;
  childHeading: string;
  childNavLabel: string;
  indexNavLabel: string;
  skipWebServer: boolean;
  hasDemoRemote: boolean;
};

function optionalPath(name: string, fallback: string): string | null {
  const raw = process.env[name];

  if (raw === '') {
    return null;
  }

  return raw ?? fallback;
}

/** Dummy value for RequireAuth's localStorage check. Not a real ASO token. */
const DEFAULT_E2E_ACCESS_TOKEN = 'e2e-local';

export function readE2eAuth(): E2eAuth {
  const email = process.env.E2E_EMAIL?.trim();
  const password = process.env.E2E_PASSWORD;

  if (email && password) {
    return { kind: 'password', email, password };
  }

  return {
    kind: 'token',
    token: process.env.E2E_ACCESS_TOKEN?.trim() || DEFAULT_E2E_ACCESS_TOKEN,
  };
}

export function readE2eTarget(): E2eTarget {
  const remotePath = process.env.E2E_REMOTE_PATH ?? '/remote';

  return {
    shellBaseUrl: process.env.E2E_SHELL_BASE_URL ?? 'http://127.0.0.1:5000',
    remoteDevUrl: process.env.E2E_REMOTE_DEV_URL ?? 'http://127.0.0.1:5001',
    remoteId: process.env.E2E_REMOTE_ID ?? 'remote',
    remotePath,
    indexPath: process.env.E2E_REMOTE_INDEX_PATH ?? remotePath,
    childPath: process.env.E2E_REMOTE_CHILD_PATH ?? `${remotePath}/details`,
    crashPath: optionalPath('E2E_REMOTE_CRASH_PATH', `${remotePath}/crash`),
    formPath: optionalPath('E2E_REMOTE_FORM_PATH', `${remotePath}/form`),
    readyHeading: process.env.E2E_REMOTE_READY_HEADING ?? 'Remote module',
    childHeading: process.env.E2E_REMOTE_CHILD_HEADING ?? 'Details',
    childNavLabel: process.env.E2E_REMOTE_CHILD_NAV_LABEL ?? 'Details',
    indexNavLabel: process.env.E2E_REMOTE_INDEX_NAV_LABEL ?? 'Overview',
    skipWebServer: process.env.E2E_SKIP_WEBSERVER === '1',
    hasDemoRemote: fs.existsSync(path.join(DEMO_REMOTE_ROOT, 'package.json')),
  };
}
