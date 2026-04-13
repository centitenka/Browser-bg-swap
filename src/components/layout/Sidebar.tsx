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
    <aside className="w-52 xl:w-64 bg-sidebar flex flex-col border-r border-border-subtle/50 h-screen select-none shrink-0">
      <div className="p-4 xl:p-6 pb-4">
        <div className="flex items-center gap-2.5 px-1.5 xl:px-2 mb-5 xl:mb-6">
          <div className="p-1.5 bg-primary/20 rounded-lg">
            <Layers size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-100 tracking-tight leading-none">
              {t('sidebar.title')}
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">{t('sidebar.subtitle')}</p>
          </div>
        </div>

        <nav className="space-y-1" role="tablist" aria-label="Main Navigation">
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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

      <div className="mt-auto p-6 pt-0">
        <div className="px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-default">
          <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
            {t('sidebar.version')}
          </p>
        </div>
      </div>
    </aside>
  );
}
