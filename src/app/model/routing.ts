import { useEffect, useState } from 'react';

export type PageKey = 'host' | 'remote';

export type PageMeta = {
  key: PageKey;
  href: string;
  owner: 'shell' | 'module';
  labelKey: 'nav.hostHome' | 'nav.remoteModule';
  descriptionKey: 'nav.hostHomeDesc' | 'nav.remoteModuleDesc';
};

export const pages: PageMeta[] = [
  {
    key: 'host',
    href: '/host',
    owner: 'shell',
    labelKey: 'nav.hostHome',
    descriptionKey: 'nav.hostHomeDesc',
  },
  {
    key: 'remote',
    href: '/remote',
    owner: 'module',
    labelKey: 'nav.remoteModule',
    descriptionKey: 'nav.remoteModuleDesc',
  },
];

export function getPageFromPath(pathname: string): PageKey {
  if (pathname === '/host' || pathname.startsWith('/host/')) {
    return 'host';
  }

  if (pathname === '/remote' || pathname.startsWith('/remote/')) {
    return 'remote';
  }

  return 'host';
}

export function getPageByKey(pageKey: PageKey): PageMeta {
  return pages.find((page) => page.key === pageKey) ?? pages[0];
}

export function useActivePage(): PageKey {
  const [activePage, setActivePage] = useState<PageKey>(() =>
    getPageFromPath(window.location.pathname)
  );

  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', pages[0].href);
    }

    const syncPageWithLocation = () => {
      setActivePage(getPageFromPath(window.location.pathname));
    };

    syncPageWithLocation();
    window.addEventListener('popstate', syncPageWithLocation);

    return () => {
      window.removeEventListener('popstate', syncPageWithLocation);
    };
  }, []);

  return activePage;
}
