import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { builtinPresets } from '../../../data/presets';
import { createDefaultSettings } from '../../../config/defaults';
import { normalizeBrowserSettings } from '../../../config/normalize';
import { useT } from '../../../i18n';
import { useConfigStore } from '../../../stores/configStore';
import type { BrowserSettings } from '../../../types';

interface PresetsSectionProps {
  onChange: (settings: Partial<BrowserSettings>) => void;
}

export function PresetsSection({ onChange }: PresetsSectionProps) {
  const t = useT();
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const { config, savePreset, deletePreset } = useConfigStore();

  const applyPreset = (settings: Partial<BrowserSettings>) => {
    onChange(normalizeBrowserSettings({ ...createDefaultSettings(), ...settings }));
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      return;
    }

    await savePreset(presetName.trim());
    setPresetName('');
    setShowSavePreset(false);
  };

  return (
    <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        {t('settings.presets')}
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {builtinPresets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset.settings)}
            title={preset.description}
            className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5 hover:border-primary/50 transition-colors"
          >
            {preset.name}
          </button>
        ))}
        {config.custom_presets.map((preset, index) => (
          <div key={`custom-${index}`} className="shrink-0 flex items-center gap-1">
            <button
              onClick={() => applyPreset(preset.settings)}
              className="px-3 py-2 rounded-l-lg text-xs font-medium bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5 hover:border-primary/50 transition-colors"
            >
              {preset.name}
            </button>
            <button
              onClick={() => deletePreset(index)}
              className="px-1.5 py-2 rounded-r-lg text-xs bg-sidebar border border-l-0 border-border-subtle/50 text-gray-500 hover:text-red-400 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3">
        {showSavePreset ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleSavePreset()}
              placeholder={t('settings.presetName')}
              className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs"
              autoFocus
            />
            <button
              onClick={() => void handleSavePreset()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/80 transition-colors"
            >
              {t('common.save')}
            </button>
            <button
              onClick={() => {
                setShowSavePreset(false);
                setPresetName('');
              }}
              className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSavePreset(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors"
          >
            <Save size={12} />
            {t('settings.savePreset')}
          </button>
        )}
      </div>
    </section>
  );
}
