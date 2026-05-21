import { useEffect, useState } from 'react';

export type PageKey = 'overview' | 'settings' | 'demo' | 'whatever';

export type PageMeta = {
  key: PageKey;
  label: string;
  href: string;
  description: string;
};

export const pages: PageMeta[] = [
  {
    key: 'overview',
    label: 'Overview',
    href: '/overview',
    description: 'Summary widgets and recent activity.',
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    description: 'Basic project and environment settings.',
  },
  {
    key: 'demo',
    label: 'Demo',
    href: '/demo',
    description: 'Remote microfrontend mounted in the host shell.',
  },
  {
    key: 'whatever',
    label: 'Whatever',
    href: '/demo/product',
    description: 'Remote product view inside the shell.',
  },
];

export function getPageFromPath(pathname: string): PageKey {
  if (pathname.startsWith('/demo/product')) {
    return 'whatever';
  }

  if (pathname.startsWith('/demo')) {
    return 'demo';
  }

  if (pathname === '/settings') {
    return 'settings';
  }

  return 'overview';
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
