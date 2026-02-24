import { ChevronRight } from 'lucide-react';

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
  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {breadcrumbs.length > 0 && (
            <nav
              className="flex items-center gap-2 text-sm"
              aria-label="面包屑导航"
            >
              {breadcrumbs.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight size={16} className="text-gray-500" aria-hidden="true" />
                  )}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-gray-400">{item.label}</span>
                  )}
                </div>
              ))}
              <ChevronRight size={16} className="text-gray-500" aria-hidden="true" />
            </nav>
          )}
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
