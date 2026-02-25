import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    border: 'border-green-500/20',
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500',
    border: 'border-red-500/20',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    border: 'border-yellow-500/20',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    border: 'border-blue-500/20',
  },
};

function ToastItemComponent({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl bg-card/95 backdrop-blur-md transition-all duration-300 animate-slide-in hover:translate-y-[-2px] ${config.border}`}
      role="alert"
      aria-live="polite"
      style={{ minWidth: '320px', maxWidth: '400px' }}
    >
      <Icon className={`shrink-0 mt-0.5 ${config.color}`} size={18} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="flex flex-col gap-3 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItemComponent key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
