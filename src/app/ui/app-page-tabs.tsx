import {
  pageHref,
  resolvePageLabel,
  type NavModule,
  type NavPage,
} from '@/app/model/nav-config';
import type { AppLocale } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type AppPageTabsProps = {
  module: NavModule;
  activePage: NavPage;
  locale: AppLocale;
  className?: string;
};

/** Compact hat page tabs — secondary row: quieter, text-weight only. */
export function AppPageTabs({
  module,
  activePage,
  locale,
  className,
}: AppPageTabsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [module.id, activePage.id]);

  if (module.pages.length < 2) {
    return null;
  }

  return (
    <nav
      aria-label={t('nav.pagesAria')}
      className={cn(
        'border-border/80 -mx-4 flex overflow-x-auto border-t px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
    >
      {module.pages.map((page) => {
        const href = pageHref(module, page);
        const isActive = page.id === activePage.id;

        return (
          <button
            key={page.id}
            ref={isActive ? activeRef : undefined}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative shrink-0 cursor-pointer px-3 py-2.5 text-sm tracking-wide uppercase transition-colors',
              isActive
                ? 'text-foreground font-semibold'
                : 'text-muted-foreground/80 hover:text-muted-foreground font-medium'
            )}
            onClick={() => {
              void navigate(href);
            }}
          >
            {resolvePageLabel(page, locale, t)}
            <span
              aria-hidden
              className={cn(
                'bg-foreground/70 absolute inset-x-3 bottom-0 h-px transition-opacity',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
