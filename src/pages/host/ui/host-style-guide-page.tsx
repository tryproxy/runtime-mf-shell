import {
  RMF_DESIGN_TOKENS,
  STYLE_GUIDE_EXAMPLE_STATES,
  STYLE_GUIDE_TOKEN_PRESENTATION,
  STYLE_GUIDE_TOKENS,
  STYLE_GUIDE_TYPE_RECIPES,
  type RmfDesignTokenName,
  type StyleGuideExampleState,
  type StyleGuideTypeRecipeId,
} from './style-guide-spec';
import { useShellToast } from '@/shared/ui/shell-toast';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
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
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/shadcn';
import {
  CircleDashedIcon,
  CircleXIcon,
  LoaderCircleIcon,
  MoreHorizontalIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function HostStyleGuidePage() {
  const { t } = useTranslation();
  const toast = useShellToast();
  const uid = useId();
  const id = (suffix: string) => `${uid}-${suffix}`;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exampleState, setExampleState] =
    useState<StyleGuideExampleState>('draft');
  const [subscribed, setSubscribed] = useState(true);
  const [notify, setNotify] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [plan, setPlan] = useState<StyleGuideExampleState>('ready');

  const inputDefaultId = id('input-default');
  const inputDisabledId = id('input-disabled');
  const inputInvalidId = id('input-invalid');
  const inputInvalidHintId = id('input-invalid-hint');
  const selectDefaultId = id('select-default');
  const selectDisabledId = id('select-disabled');
  const selectInvalidId = id('select-invalid');
  const selectInvalidHintId = id('select-invalid-hint');
  const notesDefaultId = id('notes-default');
  const notesDisabledId = id('notes-disabled');
  const notesInvalidId = id('notes-invalid');
  const notesInvalidHintId = id('notes-invalid-hint');
  const archiveId = id('archive');
  const subscribeId = id('subscribe');
  const lockedId = id('locked');
  const notifyId = id('notify');
  const alertsId = id('alerts');
  const maintenanceId = id('maintenance');
  const planDraftId = id('plan-draft');
  const planReadyId = id('plan-ready');
  const planDisabledId = id('plan-disabled');

  return (
    <section className="flex flex-col gap-3" data-rmf-style-guide="">
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

      <Card>
        <CardHeader>
          <CardTitle>{t('styleGuide.tokensTitle')}</CardTitle>
          <CardDescription>{t('styleGuide.tokensDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {STYLE_GUIDE_TOKENS.map((token) => (
              <TokenSpecimen key={token} token={token} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('styleGuide.typeTitle')}</CardTitle>
            <CardDescription>{t('styleGuide.typeDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {STYLE_GUIDE_TYPE_RECIPES.map((recipe) => (
              <TypeRecipe
                key={recipe.id}
                className={recipe.className}
                id={recipe.id}
                sample={t(`styleGuide.typeRecipes.${recipe.id}`)}
              />
            ))}
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
          <CardTitle>{t('styleGuide.formTitle')}</CardTitle>
          <CardDescription>{t('styleGuide.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ControlCluster label={t('styleGuide.clusters.buttons')}>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button">{t('styleGuide.primary')}</Button>
              <Button type="button" variant="secondary">
                {t('styleGuide.secondary')}
              </Button>
              <Button type="button" variant="outline">
                {t('styleGuide.outline')}
              </Button>
              <Button type="button" variant="destructive">
                {t('styleGuide.destructive')}
              </Button>
              <Button disabled type="button" variant="outline">
                {t('styleGuide.disabled')}
              </Button>
              <Button disabled aria-busy="true" type="button">
                <LoaderCircleIcon aria-hidden className="animate-spin" />
                {t('styleGuide.submit')}
              </Button>
            </div>
          </ControlCluster>

          <ControlCluster label={t('styleGuide.clusters.input')}>
            <div className="grid items-start gap-3 sm:grid-cols-3">
              <Field>
                <Label htmlFor={inputDefaultId}>{t('styleGuide.name')}</Label>
                <Input
                  id={inputDefaultId}
                  placeholder={t('styleGuide.namePlaceholder')}
                />
              </Field>
              <Field>
                <Label htmlFor={inputDisabledId}>
                  {t('styleGuide.nameDisabled')}
                </Label>
                <Input
                  disabled
                  id={inputDisabledId}
                  defaultValue={t('styleGuide.namePlaceholder')}
                />
              </Field>
              <Field>
                <Label htmlFor={inputInvalidId}>
                  {t('styleGuide.nameInvalid')}
                </Label>
                <Input
                  aria-describedby={inputInvalidHintId}
                  aria-invalid="true"
                  id={inputInvalidId}
                  defaultValue="?"
                />
                <p className="text-destructive text-sm" id={inputInvalidHintId}>
                  {t('styleGuide.invalidHint')}
                </p>
              </Field>
            </div>
          </ControlCluster>

          <ControlCluster label={t('styleGuide.clusters.select')}>
            <div className="grid items-start gap-3 sm:grid-cols-3">
              <Field>
                <Label htmlFor={selectDefaultId}>{t('styleGuide.state')}</Label>
                <Select
                  value={exampleState}
                  onValueChange={(value) =>
                    setExampleState(value as StyleGuideExampleState)
                  }
                >
                  <SelectTrigger className="w-full" id={selectDefaultId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <ExampleStateItems />
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Label htmlFor={selectDisabledId}>
                  {t('styleGuide.stateDisabled')}
                </Label>
                <Select disabled value="draft">
                  <SelectTrigger className="w-full" id={selectDisabledId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <ExampleStateItems />
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Label htmlFor={selectInvalidId}>
                  {t('styleGuide.stateInvalid')}
                </Label>
                <Select value="draft">
                  <SelectTrigger
                    className="w-full"
                    aria-describedby={selectInvalidHintId}
                    aria-invalid="true"
                    id={selectInvalidId}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <ExampleStateItems />
                  </SelectContent>
                </Select>
                <p
                  className="text-destructive text-sm"
                  id={selectInvalidHintId}
                >
                  {t('styleGuide.invalidHint')}
                </p>
              </Field>
            </div>
          </ControlCluster>

          <ControlCluster label={t('styleGuide.clusters.textarea')}>
            <div className="grid items-start gap-3 sm:grid-cols-3">
              <Field>
                <Label htmlFor={notesDefaultId}>{t('styleGuide.notes')}</Label>
                <Textarea
                  className="min-h-16"
                  id={notesDefaultId}
                  placeholder={t('styleGuide.notesPlaceholder')}
                />
              </Field>
              <Field>
                <Label htmlFor={notesDisabledId}>
                  {t('styleGuide.notesDisabled')}
                </Label>
                <Textarea
                  disabled
                  className="min-h-16"
                  id={notesDisabledId}
                  defaultValue={t('styleGuide.notesPlaceholder')}
                />
              </Field>
              <Field>
                <Label htmlFor={notesInvalidId}>
                  {t('styleGuide.notesInvalid')}
                </Label>
                <Textarea
                  aria-describedby={notesInvalidHintId}
                  aria-invalid="true"
                  className="min-h-16"
                  id={notesInvalidId}
                  defaultValue="?"
                />
                <p className="text-destructive text-sm" id={notesInvalidHintId}>
                  {t('styleGuide.invalidHint')}
                </p>
              </Field>
            </div>
          </ControlCluster>

          <div className="grid items-start gap-4 md:grid-cols-3">
            <ControlCluster label={t('styleGuide.clusters.checkbox')}>
              <div className="flex flex-col gap-2">
                <BooleanRow>
                  <Checkbox id={archiveId} />
                  <Label htmlFor={archiveId}>
                    {t('styleGuide.checkboxUnchecked')}
                  </Label>
                </BooleanRow>
                <BooleanRow>
                  <Checkbox
                    id={subscribeId}
                    checked={subscribed}
                    onCheckedChange={(checked) =>
                      setSubscribed(checked === true)
                    }
                  />
                  <Label htmlFor={subscribeId}>
                    {t('styleGuide.subscribe')}
                  </Label>
                </BooleanRow>
                <BooleanRow>
                  <Checkbox disabled id={lockedId} />
                  <Label htmlFor={lockedId}>
                    {t('styleGuide.checkboxDisabled')}
                  </Label>
                </BooleanRow>
              </div>
            </ControlCluster>

            <ControlCluster label={t('styleGuide.clusters.switch')}>
              <div className="flex flex-col gap-2">
                <BooleanRow>
                  <Switch
                    id={notifyId}
                    checked={notify}
                    onCheckedChange={setNotify}
                  />
                  <Label htmlFor={notifyId}>{t('styleGuide.notify')}</Label>
                </BooleanRow>
                <BooleanRow>
                  <Switch
                    id={alertsId}
                    checked={alerts}
                    onCheckedChange={setAlerts}
                  />
                  <Label htmlFor={alertsId}>{t('styleGuide.switchOn')}</Label>
                </BooleanRow>
                <BooleanRow>
                  <Switch disabled id={maintenanceId} />
                  <Label htmlFor={maintenanceId}>
                    {t('styleGuide.switchDisabled')}
                  </Label>
                </BooleanRow>
              </div>
            </ControlCluster>

            <ControlCluster label={t('styleGuide.clusters.radio')}>
              <RadioGroup
                className="gap-2"
                value={plan}
                aria-label={t('styleGuide.clusters.radio')}
                onValueChange={(value) =>
                  setPlan(value as StyleGuideExampleState)
                }
              >
                <BooleanRow>
                  <RadioGroupItem id={planDraftId} value="draft" />
                  <Label htmlFor={planDraftId}>
                    {t('styleGuide.states.draft')}
                  </Label>
                </BooleanRow>
                <BooleanRow>
                  <RadioGroupItem id={planReadyId} value="ready" />
                  <Label htmlFor={planReadyId}>
                    {t('styleGuide.states.ready')}
                  </Label>
                </BooleanRow>
                <BooleanRow>
                  <RadioGroupItem disabled id={planDisabledId} value="locked" />
                  <Label htmlFor={planDisabledId}>
                    {t('styleGuide.radioDisabled')}
                  </Label>
                </BooleanRow>
              </RadioGroup>
            </ControlCluster>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('styleGuide.statusTitle')}</CardTitle>
          <CardDescription>{t('styleGuide.statusDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{t('styleGuide.badgeDefault')}</Badge>
            <Badge variant="secondary">{t('styleGuide.badgeSecondary')}</Badge>
            <Badge variant="destructive">
              <CircleXIcon />
              {t('styleGuide.destructive')}
            </Badge>
            <Badge variant="outline">{t('styleGuide.badgeOutline')}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
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

function TokenSpecimen({ token }: { token: RmfDesignTokenName }) {
  const presentation = STYLE_GUIDE_TOKEN_PRESENTATION[token];
  const radius = `var(${RMF_DESIGN_TOKENS.radius})`;
  const surface = `var(${RMF_DESIGN_TOKENS.surface})`;
  const surfaceFg = `var(${RMF_DESIGN_TOKENS.surfaceForeground})`;

  let sample: ReactNode;

  switch (presentation.kind) {
    case 'swatch':
      sample = (
        <span
          className="ring-foreground/10 size-9 shrink-0 ring-1"
          style={{
            backgroundColor: `var(${presentation.fill})`,
            borderRadius: radius,
          }}
        />
      );
      break;
    case 'onSwatch':
      sample = (
        <span
          className="ring-foreground/10 flex size-9 shrink-0 items-center justify-center text-xs font-medium ring-1"
          style={{
            backgroundColor: `var(${presentation.fill})`,
            color: `var(${presentation.ink})`,
            borderRadius: radius,
          }}
        >
          Aa
        </span>
      );
      break;
    case 'border':
      sample = (
        <span
          className="size-9 shrink-0"
          style={{
            backgroundColor: surface,
            border: `2px solid var(${token})`,
            borderRadius: radius,
          }}
        />
      );
      break;
    case 'input':
      sample = (
        <span
          className="dark:bg-input/30 h-8 w-14 shrink-0 border bg-transparent"
          style={{
            borderColor: `var(${token})`,
            borderRadius: radius,
          }}
        />
      );
      break;
    case 'ring':
      sample = (
        <span
          className="size-9 shrink-0"
          style={{
            backgroundColor: surface,
            borderRadius: radius,
            boxShadow: `0 0 0 3px var(${token})`,
          }}
        />
      );
      break;
    case 'radius':
      sample = (
        <span
          className="size-9 shrink-0"
          style={{
            backgroundColor: surface,
            border: `1px solid var(${RMF_DESIGN_TOKENS.border})`,
            borderRadius: `var(${token})`,
          }}
        />
      );
      break;
    case 'shadow':
      sample = (
        <span
          className="size-9 shrink-0"
          style={{
            backgroundColor: surface,
            borderRadius: radius,
            boxShadow: `var(${token})`,
          }}
        />
      );
      break;
    case 'font':
      sample = (
        <span
          className="flex size-9 shrink-0 items-center justify-center text-sm font-medium"
          style={{
            backgroundColor: surface,
            color: surfaceFg,
            fontFamily: `var(${token})`,
            borderRadius: radius,
          }}
        >
          Aa
        </span>
      );
      break;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      {sample}
      <code className="text-muted-foreground truncate font-mono text-[11px] leading-tight">
        {token}
      </code>
    </div>
  );
}

function ExampleStateItems() {
  const { t } = useTranslation();

  return STYLE_GUIDE_EXAMPLE_STATES.map((state) => (
    <SelectItem key={state} value={state}>
      {t(`styleGuide.states.${state}`)}
    </SelectItem>
  ));
}

function TypeRecipe({
  id,
  className,
  sample,
}: {
  id: StyleGuideTypeRecipeId;
  className: string;
  sample: string;
}) {
  if (id === 'label') {
    return <Label className={className}>{sample}</Label>;
  }

  return <p className={className}>{sample}</p>;
}

function ControlCluster({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      {children}
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="grid gap-1.5">{children}</div>;
}

function BooleanRow({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}
