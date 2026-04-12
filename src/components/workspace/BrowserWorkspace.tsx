interface BrowserWorkspaceProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  actionBar: React.ReactNode;
}

export function BrowserWorkspace({ sidebar, content, actionBar }: BrowserWorkspaceProps) {
  return (
    <div className="pb-28">
      <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] items-start">
        <aside className="space-y-4 xl:sticky xl:top-24">{sidebar}</aside>
        <section className="min-w-0 space-y-6">{content}</section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle/60 bg-content/92 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">{actionBar}</div>
      </div>
    </div>
  );
}
