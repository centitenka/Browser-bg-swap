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
    <header className="sticky top-0 z-10 bg-content/80 backdrop-blur-md border-b border-border-subtle/30 px-8 py-5 transition-all">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
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
          <h2 className="text-2xl font-bold text-gray-50 tracking-tight">{title}</h2>
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
