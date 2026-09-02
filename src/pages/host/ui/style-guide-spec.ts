import {
  RMF_DESIGN_TOKEN_NAMES,
  RMF_DESIGN_TOKENS,
  type RmfDesignTokenName,
} from '@platform/runtime-mf-contract/design-tokens';

export { RMF_DESIGN_TOKEN_NAMES, RMF_DESIGN_TOKENS, type RmfDesignTokenName };

export const STYLE_GUIDE_EXAMPLE_STATES = ['draft', 'ready'] as const;
export type StyleGuideExampleState =
  (typeof STYLE_GUIDE_EXAMPLE_STATES)[number];

export const STYLE_GUIDE_TYPE_RECIPES = [
  {
    id: 'pageTitle',
    className: 'text-lg font-semibold tracking-tight',
  },
  {
    id: 'sectionTitle',
    className: 'font-heading text-base leading-snug font-medium',
  },
  {
    id: 'body',
    className: 'text-sm',
  },
  {
    id: 'muted',
    className: 'text-muted-foreground text-sm',
  },
  {
    id: 'label',
    className: 'text-sm leading-none font-medium',
  },
  {
    id: 'error',
    className: 'text-destructive text-sm',
  },
] as const;

export type StyleGuideTypeRecipeId =
  (typeof STYLE_GUIDE_TYPE_RECIPES)[number]['id'];

type FillSwatch = {
  kind: 'swatch';
  fill: RmfDesignTokenName;
};

type OnSwatch = {
  kind: 'onSwatch';
  fill: RmfDesignTokenName;
  ink: RmfDesignTokenName;
};

type ChromeSpecimen = {
  kind: 'border' | 'input' | 'ring' | 'radius' | 'shadow' | 'font';
};

export type StyleGuideTokenPresentation =
  | FillSwatch
  | OnSwatch
  | ChromeSpecimen;

export const STYLE_GUIDE_TOKEN_PRESENTATION: Record<
  RmfDesignTokenName,
  StyleGuideTokenPresentation
> = {
  [RMF_DESIGN_TOKENS.page]: {
    kind: 'swatch',
    fill: RMF_DESIGN_TOKENS.page,
  },
  [RMF_DESIGN_TOKENS.foreground]: {
    kind: 'onSwatch',
    fill: RMF_DESIGN_TOKENS.page,
    ink: RMF_DESIGN_TOKENS.foreground,
  },
  [RMF_DESIGN_TOKENS.surface]: {
    kind: 'swatch',
    fill: RMF_DESIGN_TOKENS.surface,
  },
  [RMF_DESIGN_TOKENS.surfaceForeground]: {
    kind: 'onSwatch',
    fill: RMF_DESIGN_TOKENS.surface,
    ink: RMF_DESIGN_TOKENS.surfaceForeground,
  },
  [RMF_DESIGN_TOKENS.muted]: {
    kind: 'swatch',
    fill: RMF_DESIGN_TOKENS.muted,
  },
  [RMF_DESIGN_TOKENS.mutedForeground]: {
    kind: 'onSwatch',
    fill: RMF_DESIGN_TOKENS.muted,
    ink: RMF_DESIGN_TOKENS.mutedForeground,
  },
  [RMF_DESIGN_TOKENS.primary]: {
    kind: 'swatch',
    fill: RMF_DESIGN_TOKENS.primary,
  },
  [RMF_DESIGN_TOKENS.primaryForeground]: {
    kind: 'onSwatch',
    fill: RMF_DESIGN_TOKENS.primary,
    ink: RMF_DESIGN_TOKENS.primaryForeground,
  },
  [RMF_DESIGN_TOKENS.secondary]: {
    kind: 'swatch',
    fill: RMF_DESIGN_TOKENS.secondary,
  },
  [RMF_DESIGN_TOKENS.secondaryForeground]: {
    kind: 'onSwatch',
    fill: RMF_DESIGN_TOKENS.secondary,
    ink: RMF_DESIGN_TOKENS.secondaryForeground,
  },
  [RMF_DESIGN_TOKENS.accent]: {
    kind: 'swatch',
    fill: RMF_DESIGN_TOKENS.accent,
  },
  [RMF_DESIGN_TOKENS.accentForeground]: {
    kind: 'onSwatch',
    fill: RMF_DESIGN_TOKENS.accent,
    ink: RMF_DESIGN_TOKENS.accentForeground,
  },
  [RMF_DESIGN_TOKENS.destructive]: {
    kind: 'swatch',
    fill: RMF_DESIGN_TOKENS.destructive,
  },
  [RMF_DESIGN_TOKENS.border]: { kind: 'border' },
  [RMF_DESIGN_TOKENS.input]: { kind: 'input' },
  [RMF_DESIGN_TOKENS.ring]: { kind: 'ring' },
  [RMF_DESIGN_TOKENS.radius]: { kind: 'radius' },
  [RMF_DESIGN_TOKENS.shadowSmall]: { kind: 'shadow' },
  [RMF_DESIGN_TOKENS.fontSans]: { kind: 'font' },
};

export const STYLE_GUIDE_TOKENS = RMF_DESIGN_TOKEN_NAMES;
