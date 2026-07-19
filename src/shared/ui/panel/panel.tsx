type PanelProps = {
  title: string;
  value: string;
  description: string;
};

export function Panel({ title, value, description }: PanelProps) {
  return (
    <div className="rounded-rmf-md border-rmf-border bg-rmf-surface shadow-rmf-sm border p-5">
      <p className="text-rmf-subtle text-sm font-medium">{title}</p>
      <p className="text-rmf-fg mt-3 text-2xl font-semibold">{value}</p>
      <p className="text-rmf-muted mt-2 text-sm">{description}</p>
    </div>
  );
}
