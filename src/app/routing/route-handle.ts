import type { NavModule, NavPage } from '@/app/remote-navigation/nav-config';

export type ModuleRouteHandle = {
  kind: 'module';
  module: NavModule;
};

export type PageRouteHandle = {
  kind: 'page';
  module: NavModule;
  page: NavPage;
};

export type AppRouteHandle = ModuleRouteHandle | PageRouteHandle;

export function isModuleHandle(handle: unknown): handle is ModuleRouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'kind' in handle &&
    (handle as { kind: string }).kind === 'module'
  );
}

export function isPageHandle(handle: unknown): handle is PageRouteHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    'kind' in handle &&
    (handle as { kind: string }).kind === 'page'
  );
}
