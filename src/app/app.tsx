import { DemoRemotePage } from '@/pages/demo-remote';
import { OverviewPage } from '@/pages/overview';
import { SettingsPage } from '@/pages/settings';
import {
  type PageKey,
  getPageByKey,
  useActivePage,
} from '@/shared/lib/routing/use-active-page';
import { AppShell } from '@/widgets/app-shell';
import { useEffect, useState } from 'react';

export type ShellTheme = 'light' | 'dark';

function App() {
  const activePage = useActivePage();
  const currentPage = getPageByKey(activePage);
  const [theme, setTheme] = useState<ShellTheme>(() => {
    const storedTheme = window.localStorage.getItem('shell-theme');

    return storedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    window.localStorage.setItem('shell-theme', theme);
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
  if (activePage === 'demo' || activePage === 'whatever') {
    return <DemoRemotePage theme={theme} />;
  }

  if (activePage === 'settings') {
    return <SettingsPage />;
  }

  return <OverviewPage />;
}

export default App;
