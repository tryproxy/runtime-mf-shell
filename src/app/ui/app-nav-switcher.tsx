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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={t('nav.switcherAria')}
          className={cn(
            'max-w-full min-w-0 justify-between gap-1.5',
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
        <DropdownMenuLabel>{t('nav.groupModules')}</DropdownMenuLabel>
        {moduleList.map((module) => {
          const isActiveModule = module.key === activeModule.key;
          const hasPages = moduleHasPages(module);

          if (!hasPages) {
            return (
              <DropdownMenuItem
                key={module.key}
                className={cn(isActiveModule && 'bg-accent/60')}
                onClick={() => onNavigate(module.href)}
              >
                <CheckIcon
                  className={cn(
                    'size-4 shrink-0',
                    isActiveModule ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span className="min-w-0 truncate">{t(module.labelKey)}</span>
              </DropdownMenuItem>
            );
          }

          return (
            <DropdownMenuSub key={module.key}>
              <DropdownMenuSubTrigger
                className={cn(isActiveModule && 'bg-accent/60')}
              >
                <CheckIcon
                  className={cn(
                    'size-4 shrink-0',
                    isActiveModule ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span className="min-w-0 truncate">{t(module.labelKey)}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="min-w-44">
                <DropdownMenuLabel>{t('nav.groupPages')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {module.pages.map((page) => {
                  const isActivePage =
                    isActiveModule && page.key === activePage.key;

                  return (
                    <DropdownMenuItem
                      key={page.key}
                      className={cn(isActivePage && 'bg-accent/60')}
                      onClick={() => onNavigate(page.href)}
                    >
                      <CheckIcon
                        className={cn(
                          'size-4 shrink-0',
                          isActivePage ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="min-w-0 truncate">
                        {t(page.labelKey)}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
