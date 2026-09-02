/** Data-driven shell navigation; routes are built without path regexes. */

import { toRemoteLocale, type AppLocale } from '@/shared/i18n';

export type NavPageLabel = {
  en: string;
  ru: string;
  es?: string;
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

export type NavModuleGroupId = 'platform' | 'demos' | 'pilots';

export type NavModule = {
  id: string;
  /** First URL segment, e.g. `host`, `remote`, `remote-angular`. */
  path: string;
  group: NavModuleGroupId;
  labelKey: string;
  descriptionKey: string;
  pages: NavPage[];
};

export type NavModuleGroup = {
  id: NavModuleGroupId;
  labelKey: string;
  modules: NavModule[];
};

const NAV_MODULE_GROUP_ORDER: readonly {
  id: NavModuleGroupId;
  labelKey: string;
}[] = [
  { id: 'platform', labelKey: 'nav.groupPlatform' },
  { id: 'demos', labelKey: 'nav.groupDemos' },
  { id: 'pilots', labelKey: 'nav.groupPilots' },
];

/**
 * Static module list. Remote `pages` stay empty and are filled at runtime
 * from fetched `nav.json` (see `useNavModules`).
 */
export const navModules: NavModule[] = [
  {
    id: 'host',
    path: 'host',
    group: 'platform',
    labelKey: 'nav.hostHome',
    descriptionKey: 'nav.hostHomeDesc',
    pages: [
      { id: 'overview', segment: '', labelKey: 'nav.pageOverview' },
      {
        id: 'style-guide',
        segment: 'style-guide',
        labelKey: 'nav.pageStyleGuide',
      },
    ],
  },
  {
    id: 'remote',
    path: 'remote',
    group: 'demos',
    labelKey: 'nav.remoteModule',
    descriptionKey: 'nav.remoteModuleDesc',
    pages: [],
  },
  {
    id: 'remoteAngular',
    path: 'remote-angular',
    group: 'demos',
    labelKey: 'nav.remoteAngular',
    descriptionKey: 'nav.remoteAngularDesc',
    pages: [],
  },
  {
    id: 'aso',
    path: 'aso',
    group: 'pilots',
    labelKey: 'nav.aso',
    descriptionKey: 'nav.asoDesc',
    pages: [],
  },
  {
    id: 'zeywin',
    path: 'zeywin',
    group: 'pilots',
    labelKey: 'nav.zeywin',
    descriptionKey: 'nav.zeywinDesc',
    pages: [],
  },
];

export function groupNavModules(modules: NavModule[]): NavModuleGroup[] {
  return NAV_MODULE_GROUP_ORDER.map((group) => ({
    id: group.id,
    labelKey: group.labelKey,
    modules: modules.filter((module) => module.group === group.id),
  })).filter((group) => group.modules.length > 0);
}

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
