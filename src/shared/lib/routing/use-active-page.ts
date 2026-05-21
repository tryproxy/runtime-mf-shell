import { useEffect, useState } from 'react';

export type PageKey = 'overview' | 'settings';

export type PageMeta = {
  key: PageKey;
  label: string;
  href: `#/${PageKey}`;
  description: string;
};

export const pages: PageMeta[] = [
  {
    key: 'overview',
    label: 'Overview',
    href: '#/overview',
    description: 'Summary widgets and recent activity.',
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '#/settings',
    description: 'Basic project and environment settings.',
  },
];

export function getPageFromHash(hash: string): PageKey {
  return hash === '#/settings' ? 'settings' : 'overview';
}

export function getPageByKey(pageKey: PageKey): PageMeta {
  return pages.find((page) => page.key === pageKey) ?? pages[0];
}

export function useActivePage(): PageKey {
  const [activePage, setActivePage] = useState<PageKey>(() =>
    getPageFromHash(window.location.hash)
  );

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = pages[0].href;
    }

    const syncPageWithHash = () => {
      setActivePage(getPageFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', syncPageWithHash);

    return () => {
      window.removeEventListener('hashchange', syncPageWithHash);
    };
  }, []);

  return activePage;
}
