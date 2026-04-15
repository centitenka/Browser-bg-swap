interface BrowserWorkspaceProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  actionBar: React.ReactNode;
}

export function BrowserWorkspace({ sidebar, content, actionBar }: BrowserWorkspaceProps) {
  return (
    <div className="space-y-6 pb-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] items-start">
        <aside className="space-y-4 xl:sticky xl:top-24">{sidebar}</aside>
        <section className="min-w-0 space-y-6">{content}</section>
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 bg-gradient-to-t from-content via-content/95 to-transparent px-4 pt-6 lg:-mx-6 lg:px-6 xl:-mx-8 xl:px-8">
        {actionBar}
      </div>
    </div>
  );
}
