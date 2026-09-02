import {
  type NavModule,
  navModules,
  pageHref,
} from '@/app/remote-navigation/nav-config';
import type { AppRouteHandle } from '@/app/routing/route-handle';
import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';

type ModuleRouteInput = {
  element: ReactNode;
  children?: RouteObject[];
};

type ModuleElements = Record<NavModule['id'], ModuleRouteInput>;

/**
 * One splat route per remote (`remote/*`) so RemoteSlot stays mounted while the
 * embedded remote's BrowserRouter changes paths under the basename.
 * Shell-owned modules may declare nested children instead of a splat.
 * Page `handle` is resolved at runtime via `useActiveNav` + nav config.
 */
export function buildModuleRoutes(elements: ModuleElements): RouteObject[] {
  return navModules.map((module) => {
    const moduleHandle: AppRouteHandle = { kind: 'module', module };
    const input = elements[module.id];

    if (input.children) {
      return {
        path: module.path,
        handle: moduleHandle,
        element: input.element,
        children: input.children,
      } satisfies RouteObject;
    }

    return {
      path: `${module.path}/*`,
      handle: moduleHandle,
      element: input.element,
    } satisfies RouteObject;
  });
}

export function resolvePageFromPathname(
  module: NavModule,
  pathname: string
): NavModule['pages'][number] {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  const exact = module.pages.find(
    (page) => pageHref(module, page) === normalized
  );

  if (exact) {
    return exact;
  }

  // Soft-fail when remote pages are still loading / fetch failed.
  return (
    module.pages[0] ?? {
      id: 'index',
      segment: '',
      labelKey: module.labelKey,
    }
  );
}

export { navModules };
