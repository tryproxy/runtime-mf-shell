/** Data-driven shell navigation; routes are built without path regexes. */

import { toRemoteLocale, type AppLocale } from '@/shared/i18n';

export type NavPageLabel = {
  en: string;
  ru: string;
};

export type NavPage = {
  id: string;
  /** Path under the module (`''` = module index). */
  segment: string;
  /** Shell-owned i18n key (host pages). */
  labelKey?: string;
  /** Labels from remote `nav.json` (resolved with locale at render). */
  label?: NavPageLabel;
};

export type NavModule = {
  id: string;
  /** First URL segment, e.g. `host`, `remote`, `remote-angular`. */
  path: string;
  labelKey: string;
  descriptionKey: string;
  pages: NavPage[];
};

/**
 * Static module list. Remote `pages` stay empty and are filled at runtime
 * from fetched `nav.json` (see `useNavModules`).
 */
export const navModules: NavModule[] = [
  {
    id: 'host',
    path: 'host',
    labelKey: 'nav.hostHome',
    descriptionKey: 'nav.hostHomeDesc',
    pages: [{ id: 'home', segment: '', labelKey: 'nav.pageHome' }],
  },
  {
    id: 'remote',
    path: 'remote',
    labelKey: 'nav.remoteModule',
    descriptionKey: 'nav.remoteModuleDesc',
    pages: [],
  },
  {
    id: 'remoteAngular',
    path: 'remote-angular',
    labelKey: 'nav.remoteAngular',
    descriptionKey: 'nav.remoteAngularDesc',
    pages: [],
  },
  {
    id: 'aso',
    path: 'aso',
    labelKey: 'nav.aso',
    descriptionKey: 'nav.asoDesc',
    pages: [],
  },
];

export function moduleHref(module: NavModule): string {
  return `/${module.path}`;
}

export function pageHref(module: NavModule, page: NavPage): string {
  return page.segment ? `/${module.path}/${page.segment}` : `/${module.path}`;
}

export function moduleHasPages(module: NavModule): boolean {
  return module.pages.length > 1;
}

export function resolvePageLabel(
  page: NavPage,
  locale: AppLocale,
  t: (key: string) => string
): string {
  if (page.label) {
    return page.label[toRemoteLocale(locale)] ?? page.label.en;
  }

  if (page.labelKey) {
    return t(page.labelKey);
  }

  return page.id;
}

export const defaultModuleHref = moduleHref(navModules[0]);
