import { Panel } from '@/shared/ui/panel';

export function HostPage() {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Host page</h3>
        <p className="mt-1 text-sm text-slate-600">
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
    </section>
  );
}
