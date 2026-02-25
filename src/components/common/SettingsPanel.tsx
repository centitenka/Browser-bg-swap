import type { BrowserSettings } from '../../types';
import { ImagePicker } from './ImagePicker';
import { Switch } from './Switch';

interface SettingsPanelProps {
  settings: BrowserSettings;
  onChange: (settings: Partial<BrowserSettings>) => void;
  onSelectImage: () => void;
}

export function SettingsPanel({
  settings,
  onChange,
  onSelectImage,
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
        />
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
