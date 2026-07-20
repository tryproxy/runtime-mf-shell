import {
  moduleHasPages,
  moduleHref,
  navModules,
  pageHref,
  type NavModule,
  type NavPage,
} from '@/app/model/nav-config';
import { useActiveNav } from '@/app/model/use-active-nav';
import { useShellAccount } from '@/app/model/use-shell-account';
import { AppNavSwitcher } from '@/app/ui/app-nav-switcher';
import { AppPageTabs } from '@/app/ui/app-page-tabs';
import { ShellAccountFooter } from '@/app/ui/shell-account-footer';
import { ShellHeaderProfile } from '@/app/ui/shell-header-profile';
import { ShellMobileBar } from '@/app/ui/shell-mobile-bar';
import { logoutSession } from '@/pages/auth';
import { APP_LOCALES, type AppLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import {
  Button,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn';
import type { ShellTheme } from '@/shared/model';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react';
import {
  type MouseEvent,
  type PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type NavLayer = 'modules' | 'pages';

type AppShellProps = PropsWithChildren<{
  theme: ShellTheme;
  locale: AppLocale;
  onThemeToggle(): void;
  onLocaleChange(locale: AppLocale): void;
}>;

export function AppShell({
  theme,
  locale,
  onThemeToggle,
  onLocaleChange,
  children,
}: AppShellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { module: activeModule, page: activePage } = useActiveNav();
  const account = useShellAccount();
  const isDark = theme === 'dark';

  const [navLayer, setNavLayer] = useState<NavLayer>(() =>
    moduleHasPages(activeModule) ? 'pages' : 'modules'
  );
  const [browsedModuleId, setBrowsedModuleId] = useState(activeModule.id);

  useEffect(() => {
    setBrowsedModuleId(activeModule.id);
    setNavLayer(moduleHasPages(activeModule) ? 'pages' : 'modules');
  }, [activeModule]);

  const layerModule =
    navLayer === 'pages'
      ? (navModules.find((module) => module.id === browsedModuleId) ??
        activeModule)
      : activeModule;

  const handleNavigate =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      void navigate(href);
    };

  const openModule = (module: NavModule) => {
    if (moduleHasPages(module)) {
      setBrowsedModuleId(module.id);
      setNavLayer('pages');
    } else {
      setNavLayer('modules');
    }
    void navigate(moduleHref(module));
  };

  return (
    <div className="bg-background text-foreground grid h-svh grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden md:grid-cols-[15rem_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)]">
      <div className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden border-r border-b px-5 py-5 md:flex md:flex-col md:justify-center">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {t('shell.brand')}
        </p>
        <h1 className="mt-2 text-lg font-semibold tracking-tight">
          {t('shell.title')}
        </h1>
      </div>

      <header className="bg-card/80 supports-backdrop-filter:bg-card/60 wideMobile:px-6 z-10 flex flex-col justify-center border-b px-4 pt-3 backdrop-blur md:col-start-2 md:row-start-1 md:pb-3">
        <div className="flex items-start justify-between gap-3 pb-3 md:pb-0">
          <ShellHeaderProfile
            account={account}
            className="min-w-0 flex-1 md:hidden"
          />
          <div className="hidden min-w-0 md:block">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {t('shell.header')}
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight">
              <span className="text-muted-foreground font-medium">
                {t(activeModule.labelKey)}
              </span>
              <span className="text-muted-foreground mx-1.5 font-normal">
                /
              </span>
              {t(activePage.labelKey)}
            </h2>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <span className="text-muted-foreground wideMobile:inline hidden text-sm">
              {t('shell.tagline')}
            </span>
            <Select
              value={locale}
              onValueChange={(value) => onLocaleChange(value as AppLocale)}
            >
              <SelectTrigger size="sm" aria-label={t('shell.language')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APP_LOCALES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onThemeToggle}
            >
              {isDark ? (
                <MoonIcon className="size-4" />
              ) : (
                <SunIcon className="size-4" />
              )}
              <span className="comfortable:inline hidden">
                {isDark ? t('shell.themeDark') : t('shell.themeLight')}
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void logoutSession().then(() => {
                  void navigate('/login');
                });
              }}
            >
              {t('auth.logout')}
            </Button>
          </div>
        </div>

        <div className="md:hidden">
          <AppNavSwitcher
            modules={navModules}
            activeModule={activeModule}
            onNavigate={(href) => {
              void navigate(href);
            }}
          />
          <AppPageTabs module={activeModule} activePage={activePage} />
        </div>
      </header>

      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden min-h-0 flex-col border-r md:row-start-2 md:flex">
        <ScrollArea className="min-h-0 min-w-0 flex-1 px-3 py-4">
          <div
            key={navLayer}
            className={cn(
              'animate-in fade-in-0 w-full min-w-0 duration-150',
              navLayer === 'pages'
                ? 'slide-in-from-right-2'
                : 'slide-in-from-left-2'
            )}
          >
            {navLayer === 'modules' ? (
              <ModulesLayer
                modules={navModules}
                activeModuleId={activeModule.id}
                t={t}
                onOpenModule={openModule}
              />
            ) : (
              <PagesLayer
                module={layerModule}
                activePageId={activePage.id}
                t={t}
                onBack={() => setNavLayer('modules')}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </ScrollArea>
        <ShellAccountFooter account={account} />
      </aside>

      <main className="bg-background wideMobile:p-6 min-h-0 min-w-0 overflow-x-auto overflow-y-auto p-4 md:col-start-2 md:row-start-2">
        {children}
      </main>

      <ShellMobileBar />
    </div>
  );
}

type Translate = (key: string) => string;

function ModulesLayer({
  modules: moduleList,
  activeModuleId,
  onOpenModule,
  t,
}: {
  modules: NavModule[];
  activeModuleId: string;
  onOpenModule: (module: NavModule) => void;
  t: Translate;
}) {
  return (
    <nav className="flex flex-col gap-1" aria-label={t('nav.modulesAria')}>
      <p className="text-muted-foreground px-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
        {t('nav.groupModules')}
      </p>
      {moduleList.map((module) => {
        const isActive = module.id === activeModuleId;
        const hasPages = moduleHasPages(module);

        return (
          <button
            key={module.id}
            type="button"
            className={cn(
              'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
            )}
            onClick={() => onOpenModule(module)}
          >
            <span className="min-w-0 flex-1 overflow-hidden">
              <span className="block truncate text-sm font-medium">
                {t(module.labelKey)}
              </span>
              <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                {t(module.descriptionKey)}
              </span>
            </span>
            {hasPages ? (
              <ChevronRightIcon
                aria-hidden
                className="text-muted-foreground size-4 shrink-0"
              />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function PagesLayer({
  module,
  activePageId,
  onBack,
  onNavigate,
  t,
}: {
  module: NavModule;
  activePageId: string;
  onBack: () => void;
  onNavigate: (href: string) => (event: MouseEvent<HTMLAnchorElement>) => void;
  t: Translate;
}) {
  return (
    <nav className="flex flex-col gap-1" aria-label={t('nav.pagesAria')}>
      <button
        type="button"
        className="text-sidebar-foreground/90 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground mb-2 flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-left transition-colors"
        onClick={onBack}
      >
        <ChevronLeftIcon className="text-muted-foreground size-4 shrink-0" />
        <span className="min-w-0 truncate text-sm font-semibold">
          {t(module.labelKey)}
        </span>
      </button>
      <p className="text-muted-foreground px-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
        {t('nav.groupPages')}
      </p>
      {module.pages.map((page: NavPage) => {
        const href = pageHref(module, page);
        const isActive = page.id === activePageId;

        return (
          <a
            key={page.id}
            href={href}
            className={cn(
              'cursor-pointer truncate rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
            )}
            onClick={onNavigate(href)}
          >
            {t(page.labelKey)}
          </a>
        );
      })}
    </nav>
  );
}
