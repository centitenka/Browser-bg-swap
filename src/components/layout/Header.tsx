import { ChevronRight } from 'lucide-react';
import { useI18n } from '../../i18n';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function Header({ title, breadcrumbs = [], actions }: HeaderProps) {
  const { lang, setLang } = useI18n();

  return (
    <header className="sticky top-0 z-10 bg-content/80 backdrop-blur-md border-b border-border-subtle/30 px-4 lg:px-8 py-3 lg:py-5 transition-all">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex flex-col gap-1">
          {breadcrumbs.length > 0 && (
            <nav
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight size={12} className="text-gray-600" aria-hidden="true" />
                  )}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-gray-300 transition-colors duration-200"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="cursor-default">{item.label}</span>
                  )}
                </div>
              ))}
            </nav>
          )}
          <h2 className="text-xl lg:text-2xl font-bold text-gray-50 tracking-tight">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {actions}

          {/* Language toggle */}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full p-0.5 border border-border-subtle/30">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                lang === 'en'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                lang === 'zh'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
