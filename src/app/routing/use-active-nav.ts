import {
  navModules,
  type NavModule,
  type NavPage,
} from '@/app/remote-navigation/nav-config';
import { useNavModules } from '@/app/remote-navigation/use-nav-modules';
import { resolvePageFromPathname } from '@/app/routing/build-module-routes';
import { isModuleHandle } from '@/app/routing/route-handle';
import { useLocation, useMatches } from 'react-router-dom';

/** Active module from route `handle`; page from live nav modules + location. */
export function useActiveNav(): {
  module: NavModule;
  page: NavPage;
} {
  const modules = useNavModules();
  const matches = useMatches();
  const { pathname } = useLocation();
  const moduleHandle = [...matches]
    .reverse()
    .map((match) => match.handle)
    .find(isModuleHandle);

  const baseModule = moduleHandle?.module ?? navModules[0];
  const module =
    modules.find((entry) => entry.id === baseModule.id) ?? baseModule;

  return {
    module,
    page: resolvePageFromPathname(module, pathname),
  };
}
