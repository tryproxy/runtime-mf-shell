import {
  RemoteNavManifestsContext,
  type RemoteNavManifestsState,
} from '@/app/remote-navigation/remote-nav-manifests-context';
import { useContext } from 'react';

export function useRemoteNavManifests(): RemoteNavManifestsState {
  return useContext(RemoteNavManifestsContext);
}
