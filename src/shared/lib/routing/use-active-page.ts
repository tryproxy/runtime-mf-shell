import { useEffect, useState } from 'react';

export type PageKey = 'host' | 'remote';

export type PageMeta = {
  key: PageKey;
  label: string;
  href: string;
  description: string;
  owner: 'shell' | 'module';
};

export const pages: PageMeta[] = [
  {
    key: 'host',
    label: 'Host home',
    href: '/host',
    description: 'Shell-owned page.',
    owner: 'shell',
  },
  {
    key: 'remote',
    label: 'Remote module',
    href: '/remote',
    description: 'Mounts the remote module.',
    owner: 'module',
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
