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
  crashControlLabel: string;
  crashErrorTitle: string;
  crashErrorDetail: string;
  formSelectLabel: string;
  formSelectOption: string;
  skipWebServer: boolean;
  hasDemoRemote: boolean;
};

/** Dummy value for RequireAuth's localStorage check. Not a real ASO token. */
const DEFAULT_E2E_ACCESS_TOKEN = 'e2e-local';

const DEFAULT_SHELL_BASE_URL = 'http://127.0.0.1:5000';

function optionalPath(name: string, fallback: string): string | null {
  const raw = process.env[name];

  if (raw === '') {
    return null;
  }

  return raw ?? fallback;
}

function envString(name: string, fallback: string): string {
  const raw = process.env[name];

  if (raw === undefined || raw === '') {
    return fallback;
  }

  return raw;
}

function isLoopbackHostname(hostname: string): boolean {
  const normalizedHostname =
    hostname.startsWith('[') && hostname.endsWith(']')
      ? hostname.slice(1, -1)
      : hostname;

  return (
    normalizedHostname === '127.0.0.1' ||
    normalizedHostname === 'localhost' ||
    normalizedHostname === '::1'
  );
}

export function isLoopbackUrl(value: string): boolean {
  try {
    return isLoopbackHostname(new URL(value).hostname);
  } catch {
    return false;
  }
}

function readShellBaseUrl(): string {
  return process.env.E2E_SHELL_BASE_URL ?? DEFAULT_SHELL_BASE_URL;
}

function readProtectedApiFlag(): boolean {
  return process.env.E2E_PROTECTED_API === '1';
}

function explicitAuthRequirementReason(shellBaseUrl: string): string | null {
  if (!isLoopbackUrl(shellBaseUrl)) {
    return `Deployed E2E_SHELL_BASE_URL (${shellBaseUrl})`;
  }

  if (readProtectedApiFlag()) {
    return 'E2E_PROTECTED_API=1';
  }

  return null;
}

export function readE2eAuth(shellBaseUrl = readShellBaseUrl()): E2eAuth {
  const email = process.env.E2E_EMAIL?.trim() ?? '';
  const password = process.env.E2E_PASSWORD;
  const passwordProvided = password !== undefined && password !== '';
  const token = process.env.E2E_ACCESS_TOKEN?.trim() ?? '';
  const explicitAuthReason = explicitAuthRequirementReason(shellBaseUrl);

  if (email && !passwordProvided) {
    throw new Error(
      'E2E_EMAIL is set without E2E_PASSWORD. Provide both, or use E2E_ACCESS_TOKEN.'
    );
  }

  if (!email && passwordProvided) {
    throw new Error(
      'E2E_PASSWORD is set without E2E_EMAIL. Provide both, or use E2E_ACCESS_TOKEN.'
    );
  }

  if (email && passwordProvided && token) {
    throw new Error(
      'Set either E2E_ACCESS_TOKEN or E2E_EMAIL+E2E_PASSWORD, not both.'
    );
  }

  if (email && passwordProvided) {
    return { kind: 'password', email, password };
  }

  if (token) {
    if (explicitAuthReason && token === DEFAULT_E2E_ACCESS_TOKEN) {
      throw new Error(
        `${explicitAuthReason} cannot use the reserved dummy E2E_ACCESS_TOKEN=${DEFAULT_E2E_ACCESS_TOKEN}. ` +
          'Provide a real E2E_ACCESS_TOKEN or E2E_EMAIL+E2E_PASSWORD.'
      );
    }

    return { kind: 'token', token };
  }

  if (explicitAuthReason) {
    throw new Error(
      `${explicitAuthReason} requires an explicit E2E_ACCESS_TOKEN or E2E_EMAIL+E2E_PASSWORD. ` +
        'The dummy e2e-local token is only for loopback UI-guard runs with no protected API calls.'
    );
  }

  return { kind: 'token', token: DEFAULT_E2E_ACCESS_TOKEN };
}

export function readE2eTarget(): E2eTarget {
  const remotePath = process.env.E2E_REMOTE_PATH ?? '/remote';
  const shellBaseUrl = readShellBaseUrl();

  return {
    shellBaseUrl,
    remoteDevUrl: process.env.E2E_REMOTE_DEV_URL ?? 'http://127.0.0.1:5001',
    remoteId: process.env.E2E_REMOTE_ID ?? 'remote',
    remotePath,
    indexPath: process.env.E2E_REMOTE_INDEX_PATH ?? remotePath,
    childPath: process.env.E2E_REMOTE_CHILD_PATH ?? `${remotePath}/details`,
    crashPath: optionalPath('E2E_REMOTE_CRASH_PATH', `${remotePath}/crash`),
    formPath: optionalPath('E2E_REMOTE_FORM_PATH', `${remotePath}/form`),
    readyHeading: envString('E2E_REMOTE_READY_HEADING', 'Remote module'),
    childHeading: envString('E2E_REMOTE_CHILD_HEADING', 'Details'),
    childNavLabel: envString('E2E_REMOTE_CHILD_NAV_LABEL', 'Details'),
    indexNavLabel: envString('E2E_REMOTE_INDEX_NAV_LABEL', 'Overview'),
    crashControlLabel: envString(
      'E2E_REMOTE_CRASH_CONTROL_LABEL',
      'Crash module render'
    ),
    crashErrorTitle: envString(
      'E2E_REMOTE_CRASH_ERROR_TITLE',
      'Something went wrong in this module'
    ),
    crashErrorDetail: envString(
      'E2E_REMOTE_CRASH_ERROR_DETAIL',
      'PoC crash: intentional module render error'
    ),
    formSelectLabel: envString('E2E_REMOTE_FORM_SELECT_LABEL', 'Team'),
    formSelectOption: envString('E2E_REMOTE_FORM_SELECT_OPTION', 'Platform'),
    skipWebServer: process.env.E2E_SKIP_WEBSERVER === '1',
    hasDemoRemote: fs.existsSync(path.join(DEMO_REMOTE_ROOT, 'package.json')),
  };
}
