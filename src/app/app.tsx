import { DemoRemotePage } from '@/pages/demo-remote';
import { OverviewPage } from '@/pages/overview';
import { SettingsPage } from '@/pages/settings';
import {
  type PageKey,
  getPageByKey,
  useActivePage,
} from '@/shared/lib/routing/use-active-page';
import { AppShell } from '@/widgets/app-shell';

function App() {
  const activePage = useActivePage();
  const currentPage = getPageByKey(activePage);

  return (
    <AppShell currentPage={currentPage}>
      <PageContent activePage={activePage} />
    </AppShell>
  );
}

type PageContentProps = {
  activePage: PageKey;
};

function PageContent({ activePage }: PageContentProps) {
  if (activePage === 'demo' || activePage === 'whatever') {
    return <DemoRemotePage />;
  }

  if (activePage === 'settings') {
    return <SettingsPage />;
  }

  return <OverviewPage />;
}

export default App;
