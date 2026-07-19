import { type PageMeta, pages } from '@/app/model/routing';
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
import { MoonIcon, SunIcon } from 'lucide-react';
import type { MouseEvent, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

type AppShellProps = PropsWithChildren<{
  currentPage: PageMeta;
  theme: ShellTheme;
  locale: AppLocale;
  onThemeToggle(): void;
  onLocaleChange(locale: AppLocale): void;
}>;

export function AppShell({
  currentPage,
  theme,
  locale,
  onThemeToggle,
  onLocaleChange,
  children,
}: AppShellProps) {
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  const handleNavigate =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      window.history.pushState(null, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
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
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-4">
            <NavGroup
              label={t('nav.groupShell')}
              items={pages.filter((page) => page.owner === 'shell')}
              currentKey={currentPage.key}
              onNavigate={handleNavigate}
              t={t}
            />
            <NavGroup
              label={t('nav.groupModule')}
              items={pages.filter((page) => page.owner === 'module')}
              currentKey={currentPage.key}
              onNavigate={handleNavigate}
              t={t}
            />
          </nav>
        </ScrollArea>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card/80 supports-backdrop-filter:bg-card/60 sticky top-0 z-10 border-b px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {t('shell.header')}
              </p>
              <h2 className="truncate text-xl font-semibold tracking-tight">
                {t(currentPage.labelKey)}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-muted-foreground hidden text-sm sm:inline">
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
                {isDark ? t('shell.themeDark') : t('shell.themeLight')}
              </Button>
            </div>
          </div>
        </header>

        <main className="bg-background flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

type NavGroupProps = {
  label: string;
  items: PageMeta[];
  currentKey: PageMeta['key'];
  onNavigate: (href: string) => (event: MouseEvent<HTMLAnchorElement>) => void;
  t: (key: string) => string;
};

function NavGroup({ label, items, currentKey, onNavigate, t }: NavGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-muted-foreground px-2 text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </p>
      {items.map((page) => {
        const isActive = page.key === currentKey;

        return (
          <a
            key={page.key}
            href={page.href}
            onClick={onNavigate(page.href)}
            className={cn(
              'rounded-lg px-3 py-2.5 transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
            )}
          >
            <div className="text-sm font-medium">{t(page.labelKey)}</div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              {t(page.descriptionKey)}
            </div>
          </a>
        );
      })}
    </div>
  );
}
