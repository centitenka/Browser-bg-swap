import { useT } from '../../../i18n';
import type { BrowserSettings } from '../../../types';

interface CustomCssSectionProps {
  settings: BrowserSettings;
  onChange: (settings: Partial<BrowserSettings>) => void;
}

export function CustomCssSection({ settings, onChange }: CustomCssSectionProps) {
  const t = useT();

  return (
    <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        {t('settings.customCss')}
      </h3>
      <textarea
        value={settings.custom_css}
        onChange={(e) => onChange({ custom_css: e.target.value })}
        placeholder="/* Your custom styles here */"
        rows={6}
        className="w-full px-3 py-2 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono resize-y"
      />
      <p className="mt-2 text-[10px] text-gray-500">
        {t('settings.customCssHint')}
      </p>
    </section>
  );
}
