import type {
  NavManifest,
  NavManifestPage,
} from '@platform/runtime-mf-contract';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Relative segment: no leading `/`, `..`, scheme, `\`, query, or hash. */
export function isValidNavSegment(segment: unknown): segment is string {
  if (typeof segment !== 'string') {
    return false;
  }

  if (segment === '') {
    return true;
  }

  if (
    segment.startsWith('/') ||
    segment.includes('..') ||
    segment.includes('\\') ||
    segment.includes('://') ||
    segment.includes('?') ||
    segment.includes('#')
  ) {
    return false;
  }

  return true;
}

function isValidPage(value: unknown): value is NavManifestPage {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.id !== 'string' || value.id.length === 0) {
    return false;
  }

  if (!isValidNavSegment(value.segment)) {
    return false;
  }

  if (!isRecord(value.label)) {
    return false;
  }

  if (
    typeof value.label.en !== 'string' ||
    typeof value.label.ru !== 'string'
  ) {
    return false;
  }

  return true;
}

/**
 * Soft validation for PoC manifests. Returns `null` when invalid
 * (caller must not crash the shell).
 */
export function validateNavManifest(
  data: unknown,
  expectedModuleId?: string
): NavManifest | null {
  if (!isRecord(data)) {
    return null;
  }

  if (data.contractVersion !== 1) {
    return null;
  }

  if (typeof data.moduleId !== 'string' || data.moduleId.length === 0) {
    return null;
  }

  if (expectedModuleId !== undefined && data.moduleId !== expectedModuleId) {
    return null;
  }

  if (!Array.isArray(data.pages)) {
    return null;
  }

  const pages: NavManifestPage[] = [];
  const ids = new Set<string>();
  const segments = new Set<string>();

  for (const page of data.pages) {
    if (!isValidPage(page)) {
      return null;
    }

    if (ids.has(page.id) || segments.has(page.segment)) {
      return null;
    }

    ids.add(page.id);
    segments.add(page.segment);
    pages.push(page);
  }

  return {
    contractVersion: 1,
    moduleId: data.moduleId,
    pages,
  };
}
