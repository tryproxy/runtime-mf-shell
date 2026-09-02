import { useShellToast } from '@/shared/ui/shell-toast';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn';
import {
  CircleDashedIcon,
  LoaderCircleIcon,
  MoreHorizontalIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

const EXAMPLE_STATES = ['draft', 'ready'] as const;
type ExampleState = (typeof EXAMPLE_STATES)[number];

export function HostStyleGuidePage() {
  const { t } = useTranslation();
  const toast = useShellToast();
  const exampleNameId = useId();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exampleName, setExampleName] = useState('');
  const [exampleState, setExampleState] = useState<ExampleState>('draft');
  const [savedSummary, setSavedSummary] = useState<string | null>(null);

  const submitExample = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = exampleName.trim();

    if (!name) {
      toast.show(t('styleGuide.required'));
      return;
    }

    const summary = t('styleGuide.saved', {
      name,
      state: t(`styleGuide.states.${exampleState}`),
    });
    setSavedSummary(summary);
    toast.show(t('styleGuide.toast'));
  };

  return (
    <section className="space-y-6" data-rmf-style-guide="">
      <header className="space-y-2">
        <p className="text-muted-foreground text-sm font-medium">
          {t('styleGuide.eyebrow')}
        </p>
        <h3 className="text-lg font-semibold tracking-tight">
          {t('styleGuide.title')}
        </h3>
        <p className="text-muted-foreground max-w-2xl text-sm">
          {t('styleGuide.description')}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('styleGuide.formTitle')}</CardTitle>
            <CardDescription>{t('styleGuide.formDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitExample}>
              <div className="space-y-2">
                <Label htmlFor={exampleNameId}>{t('styleGuide.name')}</Label>
                <Input
                  required
                  id={exampleNameId}
                  value={exampleName}
                  placeholder={t('styleGuide.namePlaceholder')}
                  onChange={(event) => setExampleName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('styleGuide.state')}</Label>
                <Select
                  value={exampleState}
                  onValueChange={(value) =>
                    setExampleState(value as ExampleState)
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label={t('styleGuide.state')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMPLE_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {t(`styleGuide.states.${state}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit">{t('styleGuide.submit')}</Button>
                <Button disabled type="button" variant="outline">
                  {t('styleGuide.disabled')}
                </Button>
              </div>

              {savedSummary ? (
                <p className="text-muted-foreground text-sm" role="status">
                  {savedSummary}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('styleGuide.actionsTitle')}</CardTitle>
            <CardDescription>
              {t('styleGuide.actionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setDialogOpen(true)}>
              {t('styleGuide.dialog')}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  <MoreHorizontalIcon />
                  {t('styleGuide.menu')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>
                  {t('styleGuide.menuLabel')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => toast.show(t('styleGuide.success'))}
                >
                  {t('styleGuide.success')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => toast.show(t('styleGuide.info'))}
                >
                  {t('styleGuide.info')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="secondary">
                  {t('styleGuide.hintToggle')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('styleGuide.hint')}</TooltipContent>
            </Tooltip>

            <Button
              type="button"
              variant="outline"
              onClick={() => toast.show(t('styleGuide.toast'))}
            >
              {t('styleGuide.toastAction')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('styleGuide.statusTitle')}</CardTitle>
          <CardDescription>{t('styleGuide.statusDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Alert>
            <CircleDashedIcon />
            <AlertTitle>{t('styleGuide.emptyTitle')}</AlertTitle>
            <AlertDescription>
              {t('styleGuide.emptyDescription')}
            </AlertDescription>
          </Alert>
          <Alert>
            <LoaderCircleIcon className="animate-spin" />
            <AlertTitle>{t('styleGuide.loadingTitle')}</AlertTitle>
            <AlertDescription>
              {t('styleGuide.loadingDescription')}
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertTitle>{t('styleGuide.errorTitle')}</AlertTitle>
            <AlertDescription>
              {t('styleGuide.errorDescription')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent closeLabel={t('styleGuide.close')}>
          <DialogHeader>
            <DialogTitle>{t('styleGuide.dialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('styleGuide.dialogDescription')}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}
