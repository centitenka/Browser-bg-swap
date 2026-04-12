interface ActionBarProps {
  summary: React.ReactNode;
  actions: React.ReactNode;
}

export function ActionBar({ summary, actions }: ActionBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle/50 bg-card/90 px-4 py-4 shadow-2xl lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="min-w-0">{summary}</div>
      <div className="flex flex-wrap items-center gap-3">{actions}</div>
    </div>
  );
}
