import { useCallback, useRef } from 'react';

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function Switch({ label, checked, onChange, description }: SwitchProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(!checked);
      }
    },
    [checked, onChange]
  );

  return (
    <label className="flex items-center justify-between p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700/80 transition-colors focus-within:ring-2 focus-within:ring-blue-500">
      <div className="flex flex-col gap-0.5">
        <span className="text-gray-200 font-medium">{label}</span>
        {description && (
          <span className="text-gray-400 text-xs">{description}</span>
        )}
      </div>
      <button
        ref={buttonRef}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
          checked ? 'bg-blue-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
          aria-hidden="true"
        />
      </button>
    </label>
  );
}
