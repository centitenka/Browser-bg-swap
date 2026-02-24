import { useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

interface ConfirmDialogProps extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {isDangerous && (
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={20} aria-hidden="true" />
              </div>
            )}
            <div className="flex-1">
              <h3
                id="confirm-title"
                className="text-lg font-semibold text-white mb-2"
              >
                {title}
              </h3>
              <p id="confirm-message" className="text-gray-300 text-sm">
                {message}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              aria-label="关闭"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-lg transition-colors text-sm ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
