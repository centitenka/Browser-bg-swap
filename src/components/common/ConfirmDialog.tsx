import { useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useT } from '../../i18n';

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
  confirmText,
  cancelText,
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useT();
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

  const resolvedConfirmText = confirmText ?? t('common.confirm');
  const resolvedCancelText = cancelText ?? t('common.cancel');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div className="relative bg-card rounded-2xl border border-border-subtle/50 shadow-2xl max-w-sm w-full animate-scale-in overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            {isDangerous && (
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <AlertTriangle className="text-red-500" size={24} aria-hidden="true" />
              </div>
            )}
            
            <div className="space-y-2">
              <h3
                id="confirm-title"
                className="text-lg font-bold text-gray-50"
              >
                {title}
              </h3>
              <p id="confirm-message" className="text-sm text-gray-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200 border border-border-subtle/30 hover:border-border-subtle/60 rounded-xl transition-all font-medium text-sm"
            >
              {resolvedCancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2.5 text-white rounded-xl transition-all font-medium text-sm shadow-lg ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                  : 'bg-primary hover:bg-primary-hover shadow-primary/25'
              }`}
            >
              {resolvedConfirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
