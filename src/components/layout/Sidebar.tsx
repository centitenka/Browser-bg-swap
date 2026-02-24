import { Chrome, FileCode, Settings } from 'lucide-react';
import type { Tab } from '../../App';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: 'firefox' as Tab, label: 'Firefox', icon: FileCode },
    { id: 'chrome' as Tab, label: 'Chrome/Edge', icon: Chrome },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, tabId: Tab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tabId);
    }
  };

  return (
    <div className="w-64 bg-gray-900 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Settings size={18} className="text-white" />
          </div>
          BrowserBgSwap
        </h1>
        <p className="text-gray-400 text-sm mt-1">浏览器背景自定义工具</p>
      </div>

      <nav className="space-y-1 flex-1" role="tablist" aria-label="主导航">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-gray-800">
        <p className="text-gray-500 text-xs">版本 v1.0.0</p>
      </div>
    </div>
  );
}
