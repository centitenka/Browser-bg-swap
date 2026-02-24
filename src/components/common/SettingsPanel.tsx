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
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">背景设置</h3>
        <ImagePicker
          path={settings.background_image}
          onSelect={onSelectImage}
          onClear={() => onChange({ background_image: null })}
        />
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">显示选项</h3>
        <div className="space-y-3">
          <Switch
            label="显示搜索框"
            checked={settings.show_search_box}
            onChange={(checked) => onChange({ show_search_box: checked })}
          />
          <Switch
            label="显示快捷方式/最近访问"
            checked={settings.show_shortcuts}
            onChange={(checked) => onChange({ show_shortcuts: checked })}
          />
        </div>
      </div>
    </div>
  );
}
