import { Panel } from '@/shared/ui/panel';
import { useState } from 'react';

export function HostPage() {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error('PoC crash: intentional shell render error');
  }

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-rmf-fg text-lg font-semibold">Host page</h3>
        <p className="text-rmf-muted mt-1 text-sm">
          Shell-owned content. This page lives only in the host app.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel
          title="Owner"
          value="Shell"
          description="Rendered by runtime-mf-shell."
        />
        <Panel
          title="Role"
          value="Host home"
          description="One shell tab / one shell path."
        />
      </div>

      <div className="rounded-rmf-md border-rmf-border bg-rmf-surface shadow-rmf-sm border p-5">
        <p className="text-rmf-subtle text-sm font-medium">Shell crash test</p>
        <p className="text-rmf-muted mt-2 text-sm">
          Throws in the shell React tree. You should see ShellErrorBoundary
          (full page), not the remote slot fallback.
        </p>
        <button
          type="button"
          className="rounded-rmf-md mt-4 border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700"
          onClick={() => setShouldCrash(true)}
        >
          Crash shell render
        </button>
      </div>
    </section>
  );
}
