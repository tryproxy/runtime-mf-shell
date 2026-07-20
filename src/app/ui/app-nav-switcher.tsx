import { moduleHref, type NavModule } from '@/app/model/nav-config';
import { cn } from '@/shared/lib';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AppNavSwitcherProps = {
  modules: NavModule[];
  activeModule: NavModule;
  onNavigate: (href: string) => void;
  className?: string;
};

/** Compact hat module tabs — primary Twitter-style underline strip. */
export function AppNavSwitcher({
  modules: moduleList,
  activeModule,
  onNavigate,
  className,
}: AppNavSwitcherProps) {
  const { t } = useTranslation();
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [activeModule.id]);

  return (
    <nav
      aria-label={t('nav.modulesAria')}
      className={cn(
        'border-border -mx-4 flex overflow-x-auto border-t px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className
      )}
    >
      {moduleList.map((module) => {
        const isActive = module.id === activeModule.id;

        return (
          <button
            key={module.id}
            ref={isActive ? activeRef : undefined}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative shrink-0 cursor-pointer px-3.5 pt-3 pb-2.5 text-[15px] transition-colors',
              isActive
                ? 'text-foreground font-bold'
                : 'text-muted-foreground hover:text-foreground/85 font-medium'
            )}
            onClick={() => onNavigate(moduleHref(module))}
          >
            {t(module.labelKey)}
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-sky-500 transition-opacity',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
