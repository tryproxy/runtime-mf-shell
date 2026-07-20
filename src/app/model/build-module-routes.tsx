import { type NavModule, navModules, pageHref } from '@/app/model/nav-config';
import type { AppRouteHandle } from '@/app/model/route-handle';
import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';

type ModuleElements = Record<NavModule['id'], ReactNode>;

/**
 * One splat route per module (`remote/*`) so RemoteSlot stays mounted while the
 * embedded remote's BrowserRouter changes paths under the basename.
 * Page `handle` is resolved at runtime via `useActiveNav` + nav config.
 */
export function buildModuleRoutes(elements: ModuleElements): RouteObject[] {
  return navModules.map((module) => {
    const moduleHandle: AppRouteHandle = { kind: 'module', module };

    return {
      path: `${module.path}/*`,
      handle: moduleHandle,
      element: elements[module.id],
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

  return module.pages[0];
}

export { navModules };
