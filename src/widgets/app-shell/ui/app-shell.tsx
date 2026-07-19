import { cn } from '@/shared/lib/cn';
import { type PageMeta, pages } from '@/shared/lib/routing/use-active-page';
import type { ShellTheme } from '@/shared/model/theme';
import type { MouseEvent, PropsWithChildren } from 'react';

type AppShellProps = PropsWithChildren<{
  currentPage: PageMeta;
  theme: ShellTheme;
  onThemeToggle(): void;
}>;

export function AppShell({
  currentPage,
  theme,
  onThemeToggle,
  children,
}: AppShellProps) {
  const handleNavigate =
    (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      window.history.pushState(null, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        'min-h-screen transition-colors',
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      )}
    >
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          className={cn(
            'border-b md:border-r md:border-b-0',
            isDark
              ? 'border-slate-800 bg-slate-900 text-slate-100'
              : 'border-slate-200 bg-slate-900 text-slate-100'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-800 px-6 py-5">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Dash
              </p>
              <h1 className="mt-2 text-lg font-semibold">Runtime shell</h1>
            </div>

            <nav className="flex flex-1 flex-col gap-4 px-3 py-4">
              <div className="flex flex-col gap-2">
                <p className="px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Shell
                </p>
                {pages
                  .filter((page) => page.owner === 'shell')
                  .map((page) => {
                    const isActive = page.key === currentPage.key;

                    return (
                      <a
                        key={page.key}
                        className={cn(
                          'block rounded-lg px-3 py-3 transition-colors',
                          isActive
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        )}
                        href={page.href}
                        onClick={handleNavigate(page.href)}
                      >
                        <div className="text-sm font-medium">{page.label}</div>
                        <div
                          className={cn(
                            'mt-1 text-xs',
                            isActive ? 'text-slate-600' : 'text-slate-400'
                          )}
                        >
                          {page.description}
                        </div>
                      </a>
                    );
                  })}
              </div>

              <div className="flex flex-col gap-2">
                <p className="px-3 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Module
                </p>
                {pages
                  .filter((page) => page.owner === 'module')
                  .map((page) => {
                    const isActive = page.key === currentPage.key;

                    return (
                      <a
                        key={page.key}
                        className={cn(
                          'block rounded-lg px-3 py-3 transition-colors',
                          isActive
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        )}
                        href={page.href}
                        onClick={handleNavigate(page.href)}
                      >
                        <div className="text-sm font-medium">{page.label}</div>
                        <div
                          className={cn(
                            'mt-1 text-xs',
                            isActive ? 'text-slate-600' : 'text-slate-400'
                          )}
                        >
                          {page.description}
                        </div>
                      </a>
                    );
                  })}
              </div>
            </nav>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header
            className={cn(
              'border-b px-6 py-4 transition-colors',
              isDark
                ? 'border-slate-800 bg-slate-900'
                : 'border-slate-200 bg-white'
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p
                  className={cn(
                    'text-xs font-semibold tracking-wide uppercase',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Header
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {currentPage.label}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'text-sm',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Simple app shell
                </div>
                <button
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                      : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200'
                  )}
                  type="button"
                  onClick={onThemeToggle}
                >
                  {isDark ? 'Dark' : 'Light'}
                </button>
              </div>
            </div>
          </header>

          <main
            className={cn(
              'flex-1 p-6 transition-colors',
              isDark ? 'bg-slate-950' : 'bg-slate-100'
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
