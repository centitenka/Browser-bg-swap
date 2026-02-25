interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-sidebar border border-border-subtle/50 flex items-center justify-center mb-6 shadow-inner">
        <div className="text-gray-500 opacity-80 scale-125">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-gray-200 mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs mb-8 leading-relaxed mx-auto">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl shadow-lg shadow-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
