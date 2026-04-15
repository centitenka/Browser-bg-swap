import { useState } from 'react';
import { Pencil, Save, Sparkles, X } from 'lucide-react';
import { builtinPresets } from '../../../data/presets';
import { createDefaultSettings } from '../../../config/defaults';
import {
  getProjectedSettingKeys,
  normalizeBrowserSettings,
  projectSettingsForBrowser,
} from '../../../config/normalize';
import { useT } from '../../../i18n';
import { useConfigStore } from '../../../stores/configStore';
import type { BrowserSettings, BrowserTab } from '../../../types';
import { useConfirm } from '../../../hooks/useConfirm';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface PresetsSectionProps {
  browser: BrowserTab;
  onChange: (settings: Partial<BrowserSettings>) => void;
}

function createPresetSettings(browser: BrowserTab, settings: Partial<BrowserSettings>): BrowserSettings {
  return projectSettingsForBrowser(
    browser,
    normalizeBrowserSettings({ ...createDefaultSettings(), ...settings })
  );
}

export function PresetsSection({ browser, onChange }: PresetsSectionProps) {
  const t = useT();
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const { config, savePreset, renamePreset, deletePreset } = useConfigStore();

  const customPresets = config.custom_presets
    .map((preset, index) => ({ preset, index }))
    .filter(({ preset }) => preset.browser === browser);

  const applyPreset = (settings: Partial<BrowserSettings>) => {
    onChange(createPresetSettings(browser, settings));
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      return;
    }

    await savePreset(browser, presetName.trim());
    setPresetName('');
    setShowSavePreset(false);
  };

  const handleDeletePreset = async (index: number, name: string) => {
    const confirmed = await confirm({
      title: t('settings.deletePresetTitle'),
      message: t('settings.deletePresetMessage', { name }),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      isDangerous: true,
    });

    if (!confirmed) {
      return;
    }

    await deletePreset(index);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        isDangerous={confirmState.isDangerous}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <section className="rounded-xl border border-border-subtle/40 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('settings.presets')}
            </h3>
            <p className="mt-2 text-sm text-gray-400">{t('settings.presetsDesc')}</p>
          </div>
          {browser === 'firefox' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] text-amber-100">
              <Sparkles size={12} />
              {t('settings.presetProjectionHint')}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {builtinPresets.map((preset) => {
            const projectedKeys = getProjectedSettingKeys(
              browser,
              normalizeBrowserSettings({ ...createDefaultSettings(), ...preset.settings })
            );

            return (
              <button
                key={`${browser}-${preset.name}`}
                onClick={() => applyPreset(preset.settings)}
                title={preset.description}
                className="shrink-0 rounded-lg border border-border-subtle/50 bg-sidebar px-3 py-2 text-left text-xs font-medium text-gray-300 transition-colors hover:border-primary/50 hover:bg-white/5"
              >
                <span className="block">{preset.name}</span>
                {projectedKeys.length > 0 && (
                  <span className="mt-1 inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-100">
                    {t('settings.presetProjected')}
                  </span>
                )}
              </button>
            );
          })}

          {customPresets.map(({ preset, index }) => (
            <div key={`custom-${browser}-${index}`} className="shrink-0 flex items-center gap-1">
              {editingIndex === index ? (
                <div className="flex items-center gap-1 rounded-lg border border-border-subtle/50 bg-sidebar px-2 py-1.5">
                  <input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void renamePreset(index, editingName);
                        setEditingIndex(null);
                      }
                    }}
                    className="w-28 bg-transparent text-xs text-gray-200 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      void renamePreset(index, editingName);
                      setEditingIndex(null);
                    }}
                    className="text-primary"
                  >
                    <Save size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => applyPreset(preset.settings)}
                  className="rounded-l-lg border border-border-subtle/50 bg-sidebar px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-primary/50 hover:bg-white/5"
                >
                  {preset.name}
                </button>
              )}
              <button
                onClick={() => {
                  setEditingIndex(index);
                  setEditingName(preset.name);
                }}
                className="border border-l-0 border-border-subtle/50 bg-sidebar px-1.5 py-2 text-xs text-gray-500 transition-colors hover:text-primary"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => void handleDeletePreset(index, preset.name)}
                className="rounded-r-lg border border-l-0 border-border-subtle/50 bg-sidebar px-1.5 py-2 text-xs text-gray-500 transition-colors hover:text-red-400"
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
                className="flex-1 rounded-lg border border-border-subtle/50 bg-sidebar/50 px-3 py-1.5 text-xs text-gray-200"
                autoFocus
              />
              <button
                onClick={() => void handleSavePreset()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/80"
              >
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setShowSavePreset(false);
                  setPresetName('');
                }}
                className="px-2 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200"
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSavePreset(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-primary"
            >
              <Save size={12} />
              {t('settings.savePreset')}
            </button>
          )}
        </div>
      </section>
    </>
  );
}
