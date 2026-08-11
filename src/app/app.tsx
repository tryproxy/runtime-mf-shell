import { RemoteNavManifestsProvider } from '@/app/remote-navigation/remote-nav-manifests-provider';
import { shellRemoteRuntimeAdapters } from '@/app/remote-runtime/remote-runtime-composition';
import { appRouter } from '@/app/routing/app-router';
import { RemoteRuntimeProvider } from '@/remote-runtime';
import { RouterProvider } from 'react-router-dom';

export default function App() {
  return (
    <RemoteNavManifestsProvider>
      <RemoteRuntimeProvider adapters={shellRemoteRuntimeAdapters}>
        <RouterProvider router={appRouter} />
      </RemoteRuntimeProvider>
    </RemoteNavManifestsProvider>
  );
}
