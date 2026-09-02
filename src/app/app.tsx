import { RemoteNavManifestsProvider } from '@/app/remote-navigation/remote-nav-manifests-provider';
import { shellRemoteRuntimeAdapters } from '@/app/remote-runtime/remote-runtime-composition';
import { appRouter } from '@/app/routing/app-router';
import { RemoteRuntimeProvider } from '@/remote-runtime';
import { TooltipProvider } from '@/shared/ui/shadcn';
import { ShellToastProvider } from '@/shared/ui/shell-toast';
import { RouterProvider } from 'react-router-dom';

export default function App() {
  return (
    <RemoteNavManifestsProvider>
      <RemoteRuntimeProvider adapters={shellRemoteRuntimeAdapters}>
        <TooltipProvider>
          <ShellToastProvider>
            <RouterProvider router={appRouter} />
          </ShellToastProvider>
        </TooltipProvider>
      </RemoteRuntimeProvider>
    </RemoteNavManifestsProvider>
  );
}
