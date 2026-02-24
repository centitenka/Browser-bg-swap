import { useEffect, useState } from 'react';
import { useConfigStore } from './stores/configStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FirefoxPanel } from './components/firefox/FirefoxPanel';
import { ChromePanel } from './components/chrome/ChromePanel';

export type Tab = 'firefox' | 'chrome';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('firefox');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { loadConfig } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, []);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'firefox':
        return 'Firefox 设置';
      case 'chrome':
        return 'Chrome/Edge 设置';
      default:
        return '设置';
    }
  };

  const getBreadcrumbs = () => {
    return [
      { label: activeTab === 'firefox' ? 'Firefox' : 'Chrome/Edge' },
    ];
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 flex flex-col">
        <Header
          title={getTitle()}
          breadcrumbs={getBreadcrumbs()}
        />

        <main className="flex-1 p-6 overflow-auto">
          <div
            className={`transition-all duration-150 ${
              isTransitioning
                ? 'opacity-0 transform translate-y-2'
                : 'opacity-100 transform translate-y-0'
            }`}
          >
            {activeTab === 'firefox' && <FirefoxPanel />}
            {activeTab === 'chrome' && <ChromePanel />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
