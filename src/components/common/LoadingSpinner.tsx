import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className={`flex items-center gap-3 ${fullScreen ? 'flex-col' : ''}`}>
      <Loader2
        size={sizeMap[size]}
        className="animate-spin text-blue-500"
        aria-hidden="true"
      />
      {text && (
        <span className={`text-gray-300 ${fullScreen ? 'text-lg' : 'text-sm'}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-gray-900/90 flex flex-col items-center justify-center z-50"
        role="alert"
        aria-busy="true"
        aria-label={text || '加载中'}
      >
        {spinnerContent}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={text || '加载中'}
    >
      {spinnerContent}
    </div>
  );
}
