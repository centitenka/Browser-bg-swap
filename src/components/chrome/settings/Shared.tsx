import { ChevronDown, ChevronRight } from 'lucide-react';
import { useT } from '../../../i18n';

export function AdvancedToggle({
  sectionKey,
  expanded,
  onToggle,
}: {
  sectionKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
}) {
  const t = useT();

  return (
    <button
      onClick={() => onToggle(sectionKey)}
      className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors mt-3"
    >
      {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      {t('common.advanced')}
    </button>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-9 h-5 bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
    </label>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono"
        />
      </div>
    </div>
  );
}

export function RangeField({
  label,
  value,
  min,
  max,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400">{label}</label>
        <span className="text-xs text-gray-500 font-mono">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

export function OptionButtons({
  value,
  options,
  onChange,
  columns,
}: {
  value: string;
  options: Array<{ id: string; label: string }>;
  onChange: (value: string) => void;
  columns: string;
}) {
  return (
    <div className={columns}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value === option.id
              ? 'bg-primary text-white'
              : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
