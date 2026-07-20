import {
  type ModuleMeta,
  type ModulePageMeta,
  moduleHasPages,
} from '@/app/model/routing';
import { cn } from '@/shared/lib';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type AppNavSwitcherProps = {
  modules: ModuleMeta[];
  activeModule: ModuleMeta;
  activePage: ModulePageMeta;
  onNavigate: (href: string) => void;
  className?: string;
};

export function AppNavSwitcher({
  modules: moduleList,
  activeModule,
  activePage,
  onNavigate,
  className,
}: AppNavSwitcherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [drillModuleKey, setDrillModuleKey] = useState<
    ModuleMeta['key'] | null
  >(null);

  const drillModule =
    drillModuleKey === null
      ? null
      : (moduleList.find((module) => module.key === drillModuleKey) ?? null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setDrillModuleKey(null);
    }
  };

  const keepMenuOpen = (event: Event) => {
    event.preventDefault();
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={t('nav.switcherAria')}
          className={cn(
            'max-w-full min-w-0 cursor-pointer justify-between gap-1.5',
            className
          )}
        >
          <span className="truncate">
            {t(activeModule.labelKey)}
            <span className="text-muted-foreground"> / </span>
            {t(activePage.labelKey)}
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {drillModule ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(event) => {
                keepMenuOpen(event);
                setDrillModuleKey(null);
              }}
            >
              <ChevronLeftIcon className="size-4 shrink-0" />
              <span className="min-w-0 truncate font-medium">
                {t(drillModule.labelKey)}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t('nav.groupPages')}</DropdownMenuLabel>
            {drillModule.pages.map((page) => {
              const isActivePage =
                drillModule.key === activeModule.key &&
                page.key === activePage.key;

              return (
                <DropdownMenuItem
                  key={page.key}
                  className={cn(
                    'cursor-pointer',
                    isActivePage && 'bg-accent/60'
                  )}
                  onClick={() => onNavigate(page.href)}
                >
                  <CheckIcon
                    className={cn(
                      'size-4 shrink-0',
                      isActivePage ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="min-w-0 truncate">{t(page.labelKey)}</span>
                </DropdownMenuItem>
              );
            })}
          </>
        ) : (
          <>
            <DropdownMenuLabel>{t('nav.groupModules')}</DropdownMenuLabel>
            {moduleList.map((module) => {
              const isActiveModule = module.key === activeModule.key;
              const hasPages = moduleHasPages(module);

              if (!hasPages) {
                return (
                  <DropdownMenuItem
                    key={module.key}
                    className={cn(
                      'cursor-pointer',
                      isActiveModule && 'bg-accent/60'
                    )}
                    onClick={() => onNavigate(module.href)}
                  >
                    <CheckIcon
                      className={cn(
                        'size-4 shrink-0',
                        isActiveModule ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span className="min-w-0 truncate">
                      {t(module.labelKey)}
                    </span>
                  </DropdownMenuItem>
                );
              }

              return (
                <DropdownMenuItem
                  key={module.key}
                  className={cn(
                    'cursor-pointer',
                    isActiveModule && 'bg-accent/60'
                  )}
                  onSelect={(event) => {
                    keepMenuOpen(event);
                    setDrillModuleKey(module.key);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'size-4 shrink-0',
                      isActiveModule ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {t(module.labelKey)}
                  </span>
                  <ChevronRightIcon
                    aria-hidden
                    className="text-muted-foreground ml-auto size-4 shrink-0"
                  />
                </DropdownMenuItem>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
