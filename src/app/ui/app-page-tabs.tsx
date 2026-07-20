import { pageHref, type NavModule, type NavPage } from '@/app/model/nav-config';
import { cn } from '@/shared/lib';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type AppPageTabsProps = {
  module: NavModule;
  activePage: NavPage;
  className?: string;
};

/** Compact hat page tabs — Twitter-style underline strip for mobile. */
export function AppPageTabs({
  module,
  activePage,
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
        'border-border -mx-4 flex gap-0 overflow-x-auto border-t px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
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
              'relative shrink-0 cursor-pointer px-3 pt-2.5 pb-2.5 text-sm transition-colors',
              isActive
                ? 'text-foreground font-bold'
                : 'text-muted-foreground hover:text-foreground/80 font-medium'
            )}
            onClick={() => {
              void navigate(href);
            }}
          >
            {t(page.labelKey)}
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-sky-500 transition-opacity',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
