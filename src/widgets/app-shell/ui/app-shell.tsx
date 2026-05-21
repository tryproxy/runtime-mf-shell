import { cn } from '@/shared/lib/cn';
import { type PageMeta, pages } from '@/shared/lib/routing/use-active-page';
import type { PropsWithChildren } from 'react';

type AppShellProps = PropsWithChildren<{
  currentPage: PageMeta;
}>;

export function AppShell({ currentPage, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-slate-900 text-slate-100 md:border-r md:border-b-0">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-800 px-6 py-5">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                Dash
              </p>
              <h1 className="mt-2 text-lg font-semibold">Runtime shell</h1>
            </div>

            <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
              {pages.map((page) => {
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
            </nav>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Header
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {currentPage.label}
                </h2>
              </div>
              <div className="text-sm text-slate-500">Simple app shell</div>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
