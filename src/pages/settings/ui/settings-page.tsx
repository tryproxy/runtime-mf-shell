import { Panel } from '@/shared/ui/panel';

export function SettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Settings page</h3>
        <p className="mt-1 text-sm text-slate-600">
          Placeholder settings content using the same shell layout.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Environment"
          value="Development"
          description="Local runtime configuration."
        />
        <Panel
          title="Version"
          value="0.0.0"
          description="Taken from the current package setup."
        />
      </div>
    </section>
  );
}
