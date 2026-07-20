import {
  moduleHref,
  type NavModule,
} from '@/app/model/nav-config';
import { cn } from '@/shared/lib';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type AppNavSwitcherProps = {
  modules: NavModule[];
  activeModule: NavModule;
  onNavigate: (href: string) => void;
  className?: string;
};

/** Mobile module picker only — pages use the compact hat tabs. */
export function AppNavSwitcher({
  modules: moduleList,
  activeModule,
  onNavigate,
  className,
}: AppNavSwitcherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
          <span className="truncate">{t(activeModule.labelKey)}</span>
          <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel>{t('nav.groupModules')}</DropdownMenuLabel>
        {moduleList.map((module) => {
          const isActiveModule = module.id === activeModule.id;

          return (
            <DropdownMenuItem
              key={module.id}
              className={cn(
                'cursor-pointer',
                isActiveModule && 'bg-accent/60'
              )}
              onClick={() => onNavigate(moduleHref(module))}
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
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
