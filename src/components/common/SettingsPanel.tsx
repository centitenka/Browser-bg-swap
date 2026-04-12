import { useT } from '../../i18n';
import type { BrowserCapabilities } from '../../config/capabilities';
import type { BrowserSettings } from '../../types';
import { ImagePicker } from './ImagePicker';
import { Switch } from './Switch';

interface SettingsPanelProps {
  settings: BrowserSettings;
  onChange: (settings: Partial<BrowserSettings>) => void;
  onSelectImage: () => void;
  capabilities: BrowserCapabilities;
}

export function SettingsPanel({
  settings,
  onChange,
  onSelectImage,
  capabilities,
}: SettingsPanelProps) {
  const t = useT();

  const showBackgroundControls =
    capabilities.supportsBackgroundColor ||
    capabilities.supportsBackgroundFit ||
    capabilities.supportsBackgroundBlur ||
    capabilities.supportsBackgroundBrightness ||
    capabilities.supportsOverlayColor ||
    capabilities.supportsOverlayOpacity;

  return (
    <div className="space-y-8">
      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {t('settings.background')}
        </h3>
        <ImagePicker
          path={settings.background_image}
          onSelect={onSelectImage}
          onClear={() => onChange({ background_image: null })}
          onDropPath={(path) => onChange({ background_image: path })}
        />

        {showBackgroundControls && (
          <div className="mt-4 space-y-4">
            {capabilities.supportsOverlayOpacity && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">{t('settings.overlayDarkness')}</label>
                  <span className="text-xs text-gray-500 font-mono">{settings.overlay_opacity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.overlay_opacity}
                  onChange={(e) => onChange({ overlay_opacity: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            )}

            {capabilities.supportsOverlayColor && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">{t('settings.overlayColor')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.overlay_color}
                    onChange={(e) => onChange({ overlay_color: e.target.value })}
                    className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.overlay_color}
                    onChange={(e) => onChange({ overlay_color: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {capabilities.supportsBackgroundColor && !settings.background_image && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">{t('settings.bgColorLabel')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.background_color}
                    onChange={(e) => onChange({ background_color: e.target.value })}
                    className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.background_color}
                    onChange={(e) => onChange({ background_color: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {capabilities.supportsBackgroundFit && settings.background_image && (
              <div>
                <label className="text-xs text-gray-400 block mb-2">{t('settings.fit')}</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
                  {['cover', 'contain', 'center', 'stretch'].map((fit) => (
                    <button
                      key={fit}
                      onClick={() => onChange({ background_fit: fit })}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        settings.background_fit === fit
                          ? 'bg-primary text-white'
                          : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {capabilities.supportsBackgroundBlur && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">{t('settings.blur')}</label>
                  <span className="text-xs text-gray-500 font-mono">{settings.background_blur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={settings.background_blur}
                  onChange={(e) => onChange({ background_blur: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            )}

            {capabilities.supportsBackgroundBrightness && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">{t('settings.brightness')}</label>
                  <span className="text-xs text-gray-500 font-mono">{settings.background_brightness}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={settings.background_brightness}
                  onChange={(e) => onChange({ background_brightness: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {t('settings.displayOptions')}
        </h3>
        <div className="divide-y divide-border-subtle/30">
          {capabilities.supportsSearchVisibility && (
            <div className="py-1">
              <Switch
                label={t('settings.showSearchBox')}
                checked={settings.show_search_box}
                onChange={(checked) => onChange({ show_search_box: checked })}
                description={t('settings.showSearchBoxDesc')}
              />
            </div>
          )}
          {capabilities.supportsShortcutsVisibility && (
            <div className="py-1">
              <Switch
                label={t('settings.showShortcuts')}
                checked={settings.show_shortcuts}
                onChange={(checked) => onChange({ show_shortcuts: checked })}
                description={t('settings.showShortcutsDesc')}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
