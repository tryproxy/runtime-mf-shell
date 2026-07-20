import {
  type ModuleMeta,
  type ModulePageMeta,
  type NavLayer,
  getActiveModulePage,
  getModuleByKey,
  getModuleFromPath,
  moduleHasPages,
  modules,
  useLocationPathname,
} from '@/app/model/routing';
import { AppNavSwitcher } from '@/app/ui/app-nav-switcher';
import { getAccessToken, logoutFromApi } from '@/pages/auth';
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
  Separator,
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

type AppShellProps = PropsWithChildren<{
  theme: ShellTheme;
  locale: AppLocale;
  onThemeToggle(): void;
  onLocaleChange(locale: AppLocale): void;
}>;

function navigateTo(href: string) {
  window.history.pushState(null, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function AppShell({
  theme,
  locale,
  onThemeToggle,
  onLocaleChange,
  children,
}: AppShellProps) {
  const { t } = useTranslation();
  const pathname = useLocationPathname();
  const activeModuleKey = getModuleFromPath(pathname);
  const activeModule = getModuleByKey(activeModuleKey);
  const activePage = getActiveModulePage(activeModule, pathname);
  const isDark = theme === 'dark';

  // Multi-page modules open Layer 2; single-page modules stay on Layer 1.
  // "Back" stays on the current route and only swaps sidebar to modules.
  const [navLayer, setNavLayer] = useState<NavLayer>(() =>
    moduleHasPages(activeModule) ? 'pages' : 'modules'
  );
  const [browsedModuleKey, setBrowsedModuleKey] = useState(activeModuleKey);

  useEffect(() => {
    const module = getModuleByKey(activeModuleKey);
    setBrowsedModuleKey(activeModuleKey);
    setNavLayer(moduleHasPages(module) ? 'pages' : 'modules');
  }, [activeModuleKey]);

  const layerModule =
    navLayer === 'pages' ? getModuleByKey(browsedModuleKey) : activeModule;

  const handleNavigate =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigateTo(href);
    };

  const openModule = (module: ModuleMeta) => {
    if (moduleHasPages(module)) {
      setBrowsedModuleKey(module.key);
      setNavLayer('pages');
    } else {
      setNavLayer('modules');
    }
    navigateTo(module.href);
  };

  const backToModules = () => {
    setNavLayer('modules');
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-60 shrink-0 flex-col border-r md:flex">
        <div className="px-5 py-5">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {t('shell.brand')}
          </p>
          <h1 className="mt-2 text-lg font-semibold tracking-tight">
            {t('shell.title')}
          </h1>
        </div>
        <Separator />
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
                modules={modules}
                activeModuleKey={activeModuleKey}
                onOpenModule={openModule}
                t={t}
              />
            ) : (
              <PagesLayer
                module={layerModule}
                activePageKey={activePage.key}
                onBack={backToModules}
                onNavigate={handleNavigate}
                t={t}
              />
            )}
          </div>
        </ScrollArea>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="bg-card/80 supports-backdrop-filter:bg-card/60 wideMobile:px-6 sticky top-0 z-10 border-b px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {t('shell.header')}
              </p>
              <h2 className="hidden truncate text-xl font-semibold tracking-tight md:block">
                <span className="text-muted-foreground font-medium">
                  {t(activeModule.labelKey)}
                </span>
                <span className="text-muted-foreground mx-1.5 font-normal">
                  /
                </span>
                {t(activePage.labelKey)}
              </h2>
              <div className="mt-1 md:hidden">
                <AppNavSwitcher
                  modules={modules}
                  activeModule={activeModule}
                  activePage={activePage}
                  onNavigate={navigateTo}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
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
              {getAccessToken() ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void logoutFromApi().then(() => navigateTo('/login'));
                  }}
                >
                  {t('auth.logout')}
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        <main className="bg-background wideMobile:p-6 min-w-0 flex-1 overflow-x-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

type Translate = (key: string) => string;

type ModulesLayerProps = {
  modules: ModuleMeta[];
  activeModuleKey: ModuleMeta['key'];
  onOpenModule: (module: ModuleMeta) => void;
  t: Translate;
};

function ModulesLayer({
  modules: moduleList,
  activeModuleKey,
  onOpenModule,
  t,
}: ModulesLayerProps) {
  return (
    <nav className="flex flex-col gap-1" aria-label={t('nav.modulesAria')}>
      <p className="text-muted-foreground px-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
        {t('nav.groupModules')}
      </p>
      {moduleList.map((module) => {
        const isActive = module.key === activeModuleKey;
        const hasPages = moduleHasPages(module);

        return (
          <button
            key={module.key}
            type="button"
            onClick={() => onOpenModule(module)}
            className={cn(
              'flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
            )}
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

type PagesLayerProps = {
  module: ModuleMeta;
  activePageKey: ModulePageMeta['key'];
  onBack: () => void;
  onNavigate: (href: string) => (event: MouseEvent<HTMLAnchorElement>) => void;
  t: Translate;
};

function PagesLayer({
  module,
  activePageKey,
  onBack,
  onNavigate,
  t,
}: PagesLayerProps) {
  return (
    <nav className="flex flex-col gap-1" aria-label={t('nav.pagesAria')}>
      <button
        type="button"
        onClick={onBack}
        className="text-sidebar-foreground/90 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground mb-2 flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-left transition-colors"
      >
        <ChevronLeftIcon className="text-muted-foreground size-4 shrink-0" />
        <span className="min-w-0 truncate text-sm font-semibold">
          {t(module.labelKey)}
        </span>
      </button>
      <p className="text-muted-foreground px-2 pb-1 text-[11px] font-semibold tracking-wide uppercase">
        {t('nav.groupPages')}
      </p>
      {module.pages.map((page) => {
        const isActive = page.key === activePageKey;

        return (
          <a
            key={page.key}
            href={page.href}
            onClick={onNavigate(page.href)}
            className={cn(
              'cursor-pointer truncate rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
            )}
          >
            {t(page.labelKey)}
          </a>
        );
      })}
    </nav>
  );
}
