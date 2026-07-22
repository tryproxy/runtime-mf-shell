/** Data-driven shell nav. Routes are built from this — no path regex matching. */

export type NavPage = {
  id: string;
  /** Path under the module (`''` = module index). */
  segment: string;
  labelKey: string;
};

export type NavModule = {
  id: string;
  /** First URL segment, e.g. `host`, `remote`, `remote-angular`. */
  path: string;
  labelKey: string;
  descriptionKey: string;
  pages: NavPage[];
};

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
    pages: [
      { id: 'overview', segment: '', labelKey: 'nav.pageOverview' },
      { id: 'details', segment: 'details', labelKey: 'nav.pageDetails' },
      { id: 'about', segment: 'about', labelKey: 'nav.pageAbout' },
      { id: 'form', segment: 'form', labelKey: 'nav.pageForm' },
      { id: 'crash', segment: 'crash', labelKey: 'nav.pageCrash' },
    ],
  },
  {
    id: 'remoteAngular',
    path: 'remote-angular',
    labelKey: 'nav.remoteAngular',
    descriptionKey: 'nav.remoteAngularDesc',
    // Temporary hardcode until stage 05 wires fetched nav.json (Overview + About).
    pages: [
      { id: 'overview', segment: '', labelKey: 'nav.pageOverview' },
      { id: 'about', segment: 'about', labelKey: 'nav.pageAbout' },
    ],
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

export const defaultModuleHref = moduleHref(navModules[0]);
