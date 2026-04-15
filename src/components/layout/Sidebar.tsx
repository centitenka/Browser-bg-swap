import { Chrome, FileCode, Layers } from 'lucide-react';
import type { Tab } from '../../App';
import { useT } from '../../i18n';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const t = useT();

  const tabs = [
    { id: 'firefox' as Tab, label: t('sidebar.firefox'), icon: FileCode },
    { id: 'chrome' as Tab, label: t('sidebar.chrome'), icon: Chrome },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, tabId: Tab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tabId);
    }
  };

  return (
    <aside className="w-full shrink-0 select-none border-b border-border-subtle/50 bg-sidebar lg:h-screen lg:w-52 lg:border-b-0 lg:border-r xl:w-64">
      <div className="p-4 pb-4 xl:p-6 lg:h-full">
        <div className="mb-5 flex items-center justify-between gap-3 px-1.5 xl:mb-6 xl:px-2">
          <div className="p-1.5 bg-primary/20 rounded-lg">
            <Layers size={20} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold leading-none tracking-tight text-gray-100">
              {t('sidebar.title')}
            </h1>
            <p className="mt-1 truncate text-xs font-medium text-gray-500">{t('sidebar.subtitle')}</p>
          </div>
          <div className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 lg:hidden">
            {t('sidebar.version')}
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1" role="tablist" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className={`flex min-w-[140px] flex-1 items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:w-full ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto hidden p-6 pt-0 lg:block">
        <div className="px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
          <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
            {t('sidebar.version')}
          </p>
        </div>
      </div>
    </aside>
  );
}
