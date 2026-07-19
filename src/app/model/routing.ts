import { useEffect, useState } from 'react';

export type ModuleKey = 'host' | 'remote' | 'remoteAngular';

export type NavLayer = 'modules' | 'pages';

export type ModulePageMeta = {
  key: string;
  href: string;
  labelKey:
    | 'nav.pageHome'
    | 'nav.pageOverview'
    | 'nav.pageDetails'
    | 'nav.pageAbout'
    | 'nav.pageForm'
    | 'nav.pageCrash';
};

export type ModuleMeta = {
  key: ModuleKey;
  href: string;
  labelKey: 'nav.hostHome' | 'nav.remoteModule' | 'nav.remoteAngular';
  descriptionKey:
    | 'nav.hostHomeDesc'
    | 'nav.remoteModuleDesc'
    | 'nav.remoteAngularDesc';
  pages: ModulePageMeta[];
};

export type PageKey = ModuleKey;

export const modules: ModuleMeta[] = [
  {
    key: 'host',
    href: '/host',
    labelKey: 'nav.hostHome',
    descriptionKey: 'nav.hostHomeDesc',
    pages: [
      {
        key: 'home',
        href: '/host',
        labelKey: 'nav.pageHome',
      },
    ],
  },
  {
    key: 'remote',
    href: '/remote',
    labelKey: 'nav.remoteModule',
    descriptionKey: 'nav.remoteModuleDesc',
    pages: [
      {
        key: 'overview',
        href: '/remote',
        labelKey: 'nav.pageOverview',
      },
      {
        key: 'details',
        href: '/remote/details',
        labelKey: 'nav.pageDetails',
      },
      {
        key: 'about',
        href: '/remote/about',
        labelKey: 'nav.pageAbout',
      },
      {
        key: 'form',
        href: '/remote/form',
        labelKey: 'nav.pageForm',
      },
      {
        key: 'crash',
        href: '/remote/crash',
        labelKey: 'nav.pageCrash',
      },
    ],
  },
  {
    key: 'remoteAngular',
    href: '/remote-angular',
    labelKey: 'nav.remoteAngular',
    descriptionKey: 'nav.remoteAngularDesc',
    pages: [
      {
        key: 'overview',
        href: '/remote-angular',
        labelKey: 'nav.pageOverview',
      },
    ],
  },
];

export function getModuleFromPath(pathname: string): ModuleKey {
  if (pathname === '/host' || pathname.startsWith('/host/')) {
    return 'host';
  }

  if (
    pathname === '/remote-angular' ||
    pathname.startsWith('/remote-angular/')
  ) {
    return 'remoteAngular';
  }

  if (pathname === '/remote' || pathname.startsWith('/remote/')) {
    return 'remote';
  }

  return 'host';
}

export function getModuleByKey(moduleKey: ModuleKey): ModuleMeta {
  return modules.find((module) => module.key === moduleKey) ?? modules[0];
}

/** True when the module declares more than its main/landing page — Layer 2 nav applies. */
export function moduleHasPages(module: ModuleMeta): boolean {
  return module.pages.length > 1;
}

export function getActiveModulePage(
  module: ModuleMeta,
  pathname: string
): ModulePageMeta {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  const exact = module.pages.find((page) => page.href === normalized);
  if (exact) {
    return exact;
  }

  const nested = module.pages
    .filter(
      (page) =>
        page.href !== module.href && normalized.startsWith(`${page.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];

  return nested ?? module.pages[0];
}

export function useLocationPathname(): string {
  const [pathname, setPathname] = useState(
    () => window.location.pathname || '/'
  );

  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', modules[0].href);
      setPathname(modules[0].href);
    }

    const sync = () => {
      setPathname(window.location.pathname || '/');
    };

    sync();
    window.addEventListener('popstate', sync);

    return () => {
      window.removeEventListener('popstate', sync);
    };
  }, []);

  return pathname;
}

export function useActivePage(): ModuleKey {
  const pathname = useLocationPathname();
  return getModuleFromPath(pathname);
}
