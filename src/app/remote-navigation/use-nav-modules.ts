import {
  navModules,
  type NavModule,
  type NavPage,
} from '@/app/remote-navigation/nav-config';
import { useRemoteNavManifests } from '@/app/remote-navigation/use-remote-nav-manifests';
import { useMemo } from 'react';

/**
 * Static modules + remote pages from fetched `nav.json`.
 * Soft-fail: if a manifest is missing, that module keeps `pages: []`.
 */
export function useNavModules(): NavModule[] {
  const { byModuleId } = useRemoteNavManifests();

  return useMemo(
    () =>
      navModules.map((module) => {
        const manifest = byModuleId[module.id];

        if (!manifest) {
          return module;
        }

        const pages: NavPage[] = manifest.pages.map((page) => ({
          id: page.id,
          segment: page.segment,
          label: page.label,
        }));

        return { ...module, pages };
      }),
    [byModuleId]
  );
}
