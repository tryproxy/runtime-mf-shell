export const APP_BREAKPOINTS = {
  compact: {
    label: 'compact',
    min: 500,
    up: '(min-width: 500px)',
    down: '(max-width: 499px)',
  },
  comfortable: {
    label: 'comfortable',
    min: 560,
    up: '(min-width: 560px)',
    down: '(max-width: 559px)',
  },
  sm: {
    label: 'sm',
    min: 640,
    up: '(min-width: 640px)',
    down: '(max-width: 639px)',
  },
  wideMobile: {
    label: 'wideMobile',
    min: 740,
    up: '(min-width: 740px)',
    down: '(max-width: 739px)',
  },
  md: {
    label: 'md',
    min: 768,
    up: '(min-width: 768px)',
    down: '(max-width: 767px)',
  },
  lg: {
    label: 'lg',
    min: 1024,
    up: '(min-width: 1024px)',
    down: '(max-width: 1023px)',
  },
  xl: {
    label: 'xl',
    min: 1280,
    up: '(min-width: 1280px)',
    down: '(max-width: 1279px)',
  },
} as const;
