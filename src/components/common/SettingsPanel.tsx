import type { BrowserSettings } from '../../types';
import { ImagePicker } from './ImagePicker';
import { Switch } from './Switch';

interface SettingsPanelProps {
  settings: BrowserSettings;
  onChange: (settings: Partial<BrowserSettings>) => void;
  onSelectImage: () => void;
  showOverlay?: boolean;
}

export function SettingsPanel({
  settings,
  onChange,
  onSelectImage,
  showOverlay = true,
}: SettingsPanelProps) {
  return (
    <div className="space-y-8">
      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Background Image
        </h3>
        <ImagePicker
          path={settings.background_image}
          onSelect={onSelectImage}
          onClear={() => onChange({ background_image: null })}
          onDropPath={(path) => onChange({ background_image: path })}
        />
        {showOverlay && settings.background_image && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Overlay Opacity</label>
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
      </section>

      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Display Options
        </h3>
        <div className="divide-y divide-border-subtle/30">
          <div className="py-1">
            <Switch
              label="Show Search Box"
              checked={settings.show_search_box}
              onChange={(checked) => onChange({ show_search_box: checked })}
              description="Toggle the visibility of the search bar on the new tab page."
            />
          </div>
          <div className="py-1">
            <Switch
              label="Show Shortcuts"
              checked={settings.show_shortcuts}
              onChange={(checked) => onChange({ show_shortcuts: checked })}
              description="Display your most visited sites or custom shortcuts."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
