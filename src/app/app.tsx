import { HostPage } from '@/pages/host';
import { RemotePage } from '@/pages/remote';
import {
  type PageKey,
  getPageByKey,
  useActivePage,
} from '@/shared/lib/routing/use-active-page';
import type { ShellTheme } from '@/shared/model/theme';
import { AppShell } from '@/widgets/app-shell';
import { useEffect, useState } from 'react';

function App() {
  const activePage = useActivePage();
  const currentPage = getPageByKey(activePage);
  const [theme, setTheme] = useState<ShellTheme>(() => {
    const storedTheme = window.localStorage.getItem('shell-theme');

    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    window.localStorage.setItem('shell-theme', theme);
    document.documentElement.dataset.rmfTheme = theme;
  }, [theme]);

  return (
    <AppShell
      currentPage={currentPage}
      theme={theme}
      onThemeToggle={() =>
        setTheme((currentTheme) =>
          currentTheme === 'light' ? 'dark' : 'light'
        )
      }
    >
      <PageContent activePage={activePage} theme={theme} />
    </AppShell>
  );
}

type PageContentProps = {
  activePage: PageKey;
  theme: ShellTheme;
};

function PageContent({ activePage, theme }: PageContentProps) {
  if (activePage === 'remote') {
    return <RemotePage theme={theme} />;
  }

  return <HostPage />;
}

export default App;
