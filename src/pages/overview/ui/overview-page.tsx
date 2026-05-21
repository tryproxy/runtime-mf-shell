import { Panel } from '@/shared/ui/panel';

export function OverviewPage() {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Overview page</h3>
        <p className="mt-1 text-sm text-slate-600">
          Basic dashboard content with a persistent sidebar and header.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Panel title="Status" value="Healthy" description="Shell is running." />
        <Panel
          title="Modules"
          value="2 pages"
          description="Overview and settings are wired."
        />
        <Panel
          title="Navigation"
          value="Sidebar"
          description="Links stay available across pages."
        />
      </div>
    </section>
  );
}
