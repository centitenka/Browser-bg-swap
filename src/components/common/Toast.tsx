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
    bg: 'bg-green-900/90',
    border: 'border-green-700',
    text: 'text-green-100',
    iconColor: 'text-green-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-900/90',
    border: 'border-red-700',
    text: 'text-red-100',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-900/90',
    border: 'border-yellow-700',
    text: 'text-yellow-100',
    iconColor: 'text-yellow-400',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-900/90',
    border: 'border-blue-700',
    text: 'text-blue-100',
    iconColor: 'text-blue-400',
  },
};

function ToastItemComponent({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const config = typeConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md animate-slide-in ${config.bg} ${config.border}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`shrink-0 ${config.iconColor}`} size={20} aria-hidden="true" />
      <p className={`flex-1 text-sm ${config.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="关闭通知"
      >
        <X size={16} className="text-gray-400" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-label="通知"
    >
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
