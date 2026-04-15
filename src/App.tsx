import { useEffect, useState, useMemo } from 'react';
import { useConfigStore } from './stores/configStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { FirefoxPanel } from './components/firefox/FirefoxPanel';
import { ChromePanel } from './components/chrome/ChromePanel';
import { I18nContext, createT, getSavedLang, saveLang, type Lang } from './i18n';

export type Tab = 'firefox' | 'chrome';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('firefox');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lang, setLangState] = useState<Lang>(getSavedLang);
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const setStoreTab = useConfigStore((s) => s.setActiveTab);
  const dirtyByTab = useConfigStore((s) => s.dirtyByTab);

  const setLang = (l: Lang) => {
    setLangState(l);
    saveLang(l);
  };

  const t = useMemo(() => createT(lang), [lang]);
  const i18nValue = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setStoreTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'firefox':
        return 'Firefox';
      case 'chrome':
        return 'Chrome / Edge';
      default:
        return t('nav.settings');
    }
  };

  const getBreadcrumbs = () => {
    return [
      { label: t('nav.settings') },
      { label: activeTab === 'firefox' ? 'Firefox' : 'Chrome / Edge' },
    ];
  };

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="flex min-h-screen flex-col overflow-hidden lg:h-screen lg:flex-row">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            title={getTitle()}
            breadcrumbs={getBreadcrumbs()}
            actions={
              <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-border-subtle/50 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                <span
                  className={`h-2 w-2 rounded-full ${
                    dirtyByTab[activeTab] ? 'bg-amber-400' : 'bg-green-400'
                  }`}
                />
                {dirtyByTab[activeTab] ? t('preview.pendingChanges') : t('preview.workspaceSynced')}
              </div>
            }
          />

          <main className="min-h-0 flex-1 overflow-y-auto bg-content scroll-smooth">
            <div className="mx-auto w-full max-w-7xl p-4 lg:p-6 xl:p-8">
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isTransitioning
                    ? 'opacity-0 translate-y-4'
                    : 'opacity-100 translate-y-0'
                }`}
              >
                {activeTab === 'firefox' && <FirefoxPanel />}
                {activeTab === 'chrome' && <ChromePanel />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </I18nContext.Provider>
  );
}

export default App;
