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
        className="animate-spin text-primary"
        aria-hidden="true"
      />
      {text && (
        <span className={`text-gray-400 font-medium ${fullScreen ? 'text-base' : 'text-sm'}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-sidebar/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-200"
        role="alert"
        aria-busy="true"
        aria-label={text || 'Loading'}
      >
        {spinnerContent}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={text || 'Loading'}
      className="inline-flex"
    >
      {spinnerContent}
    </div>
  );
}
