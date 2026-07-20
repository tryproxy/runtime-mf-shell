import { resolvePageFromPathname } from '@/app/model/build-module-routes';
import {
  navModules,
  type NavModule,
  type NavPage,
} from '@/app/model/nav-config';
import { isModuleHandle } from '@/app/model/route-handle';
import { useLocation, useMatches } from 'react-router-dom';

/** Active module from route `handle`; page from nav config + location. */
export function useActiveNav(): {
  module: NavModule;
  page: NavPage;
} {
  const matches = useMatches();
  const { pathname } = useLocation();
  const moduleHandle = [...matches]
    .reverse()
    .map((match) => match.handle)
    .find(isModuleHandle);

  const module = moduleHandle?.module ?? navModules[0];

  return {
    module,
    page: resolvePageFromPathname(module, pathname),
  };
}
