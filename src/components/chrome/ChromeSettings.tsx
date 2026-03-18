import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import type { BrowserSettings, Shortcut } from '../../types';
import { ImagePicker } from '../common/ImagePicker';
import { builtinPresets } from '../../data/presets';
import { defaultSettings, useConfigStore } from '../../stores/configStore';

interface ChromeSettingsProps {
  settings: BrowserSettings;
  onChange: (settings: Partial<BrowserSettings>) => void;
  onSelectImage: () => void;
}

const searchEngines = [
  { id: 'google', label: 'Google' },
  { id: 'bing', label: 'Bing' },
  { id: 'baidu', label: 'Baidu' },
  { id: 'duckduckgo', label: 'DuckDuckGo' },
];

const backgroundFitOptions = [
  { id: 'cover', label: 'Cover' },
  { id: 'contain', label: 'Contain' },
  { id: 'center', label: 'Center' },
  { id: 'stretch', label: 'Stretch' },
];

const fontWeightOptions = [
  { id: 'light', label: 'Light' },
  { id: 'normal', label: 'Normal' },
  { id: 'bold', label: 'Bold' },
];

const columnsOptions = [
  { id: 'auto', label: 'Auto' },
  { id: '2', label: '2' },
  { id: '3', label: '3' },
  { id: '4', label: '4' },
  { id: '5', label: '5' },
  { id: '6', label: '6' },
];

const borderStyleOptions = [
  { id: 'none', label: 'None' },
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'double', label: 'Double' },
];

const shapeOptions = [
  { id: 'auto', label: 'Auto' },
  { id: 'square', label: 'Square' },
  { id: 'circle', label: 'Circle' },
];

const fontFamilyOptions = [
  { id: 'system', label: 'System' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' },
];

function AdvancedToggle({
  sectionKey,
  expanded,
  onToggle,
}: {
  sectionKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(sectionKey)}
      className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors mt-3"
    >
      {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      Advanced
    </button>
  );
}

export function ChromeSettings({ settings, onChange, onSelectImage }: ChromeSettingsProps) {
  const [editingShortcut, setEditingShortcut] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const { config, savePreset, deletePreset } = useConfigStore();

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateShortcut = (index: number, field: keyof Shortcut, value: string) => {
    const updated = [...settings.shortcuts];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ shortcuts: updated });
  };

  const addShortcut = () => {
    onChange({
      shortcuts: [...settings.shortcuts, { title: 'New', url: 'https://', icon: '\uD83D\uDD17' }],
    });
    setEditingShortcut(settings.shortcuts.length);
  };

  const removeShortcut = (index: number) => {
    onChange({ shortcuts: settings.shortcuts.filter((_, i) => i !== index) });
    setEditingShortcut(null);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    await savePreset(presetName.trim());
    setPresetName('');
    setShowSavePreset(false);
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Presets
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {builtinPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange({ ...defaultSettings, ...preset.settings })}
              title={preset.description}
              className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5 hover:border-primary/50 transition-colors"
            >
              {preset.name}
            </button>
          ))}
          {config.custom_presets.map((preset, index) => (
            <div key={`custom-${index}`} className="shrink-0 flex items-center gap-1">
              <button
                onClick={() => onChange({ ...defaultSettings, ...preset.settings })}
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
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                placeholder="Preset name..."
                className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs"
                autoFocus
              />
              <button
                onClick={handleSavePreset}
                className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/80 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setShowSavePreset(false); setPresetName(''); }}
                className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSavePreset(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors"
            >
              <Save size={12} />
              Save Current as Preset
            </button>
          )}
        </div>
      </section>

      {/* Background */}
      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Background
        </h3>
        <ImagePicker
          path={settings.background_image}
          onSelect={onSelectImage}
          onClear={() => onChange({ background_image: null })}
          onDropPath={(path) => onChange({ background_image: path })}
        />
        {settings.background_image && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Overlay Darkness</label>
                <span className="text-xs text-gray-500 font-mono">{settings.overlay_opacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={settings.overlay_opacity}
                onChange={(e) => onChange({ overlay_opacity: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Overlay Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.overlay_color} onChange={(e) => onChange({ overlay_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
                <input type="text" value={settings.overlay_color} onChange={(e) => onChange({ overlay_color: e.target.value })} className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono" />
              </div>
            </div>
          </div>
        )}

        <AdvancedToggle
          sectionKey="background"
          expanded={!!expandedSections['background']}
          onToggle={toggleSection}
        />
        {expandedSections['background'] && (
          <div className="mt-3 space-y-4 pl-3 border-l-2 border-border-subtle/30">
            {!settings.background_image && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">Background Color</label>
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
            <div>
              <label className="text-xs text-gray-400 block mb-2">Fit</label>
              <div className="grid grid-cols-4 gap-1.5">
                {backgroundFitOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onChange({ background_fit: opt.id })}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      settings.background_fit === opt.id
                        ? 'bg-primary text-white'
                        : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Blur</label>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">Brightness</label>
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
          </div>
        )}
      </section>

      {/* Clock */}
      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_clock}
              onChange={(e) => onChange({ show_clock: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>
        {settings.show_clock && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.clock_color}
                    onChange={(e) => onChange({ clock_color: e.target.value })}
                    className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={settings.clock_color}
                    onChange={(e) => onChange({ clock_color: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Size</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={32}
                    max={120}
                    value={settings.clock_size}
                    onChange={(e) => onChange({ clock_size: Number(e.target.value) })}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs text-gray-500 font-mono w-10 text-right">{settings.clock_size}px</span>
                </div>
              </div>
            </div>

            <AdvancedToggle
              sectionKey="clock"
              expanded={!!expandedSections['clock']}
              onToggle={toggleSection}
            />
            {expandedSections['clock'] && (
              <div className="space-y-4 pl-3 border-l-2 border-border-subtle/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">24-hour format</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.clock_format_24h}
                      onChange={(e) => onChange({ clock_format_24h: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Show seconds</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.clock_show_seconds}
                      onChange={(e) => onChange({ clock_show_seconds: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Show date</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.clock_show_date}
                      onChange={(e) => onChange({ clock_show_date: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Font Weight</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {fontWeightOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onChange({ clock_font_weight: opt.id })}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          settings.clock_font_weight === opt.id
                            ? 'bg-primary text-white'
                            : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Font Family</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {fontFamilyOptions.map((opt) => (
                      <button key={opt.id} onClick={() => onChange({ clock_font_family: opt.id })} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings.clock_font_family === opt.id ? 'bg-primary text-white' : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Shadow Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.clock_shadow_color} onChange={(e) => onChange({ clock_shadow_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
                    <input type="text" value={settings.clock_shadow_color} onChange={(e) => onChange({ clock_shadow_color: e.target.value })} className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Shadow Blur</label><span className="text-xs text-gray-500 font-mono">{settings.clock_shadow_blur}px</span></div>
                  <input type="range" min={0} max={40} value={settings.clock_shadow_blur} onChange={(e) => onChange({ clock_shadow_blur: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Shadow Opacity</label><span className="text-xs text-gray-500 font-mono">{settings.clock_shadow_opacity}%</span></div>
                  <input type="range" min={0} max={100} value={settings.clock_shadow_opacity} onChange={(e) => onChange({ clock_shadow_opacity: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Letter Spacing</label><span className="text-xs text-gray-500 font-mono">{settings.clock_letter_spacing}px</span></div>
                  <input type="range" min={-5} max={20} value={settings.clock_letter_spacing} onChange={(e) => onChange({ clock_letter_spacing: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Search */}
      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_search_box}
              onChange={(e) => onChange({ show_search_box: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>
        {settings.show_search_box && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-2">Search Engine</label>
              <div className="grid grid-cols-2 gap-2">
                {searchEngines.map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => onChange({ search_engine: eng.id })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      settings.search_engine === eng.id
                        ? 'bg-primary text-white'
                        : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {eng.label}
                  </button>
                ))}
              </div>
            </div>

            <AdvancedToggle
              sectionKey="search"
              expanded={!!expandedSections['search']}
              onToggle={toggleSection}
            />
            {expandedSections['search'] && (
              <div className="space-y-4 pl-3 border-l-2 border-border-subtle/30">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.search_bg_color}
                      onChange={(e) => onChange({ search_bg_color: e.target.value })}
                      className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.search_bg_color}
                      onChange={(e) => onChange({ search_bg_color: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Opacity</label>
                    <span className="text-xs text-gray-500 font-mono">{settings.search_bg_opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.search_bg_opacity}
                    onChange={(e) => onChange({ search_bg_opacity: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Border Radius</label>
                    <span className="text-xs text-gray-500 font-mono">{settings.search_border_radius}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={settings.search_border_radius}
                    onChange={(e) => onChange({ search_border_radius: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Placeholder Text</label>
                  <input type="text" value={settings.search_placeholder} onChange={(e) => onChange({ search_placeholder: e.target.value })} className="w-full px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Border Style</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {borderStyleOptions.map((opt) => (
                      <button key={opt.id} onClick={() => onChange({ search_border_style: opt.id })} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings.search_border_style === opt.id ? 'bg-primary text-white' : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                {settings.search_border_style !== 'none' && (<>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Border Width</label><span className="text-xs text-gray-500 font-mono">{settings.search_border_width}px</span></div>
                    <input type="range" min={0} max={5} value={settings.search_border_width} onChange={(e) => onChange({ search_border_width: Number(e.target.value) })} className="w-full accent-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.search_border_color} onChange={(e) => onChange({ search_border_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
                      <input type="text" value={settings.search_border_color} onChange={(e) => onChange({ search_border_color: e.target.value })} className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono" />
                    </div>
                  </div>
                </>)}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Shadow Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.search_shadow_color} onChange={(e) => onChange({ search_shadow_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
                    <input type="text" value={settings.search_shadow_color} onChange={(e) => onChange({ search_shadow_color: e.target.value })} className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Shadow Blur</label><span className="text-xs text-gray-500 font-mono">{settings.search_shadow_blur}px</span></div>
                  <input type="range" min={0} max={40} value={settings.search_shadow_blur} onChange={(e) => onChange({ search_shadow_blur: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Shadow Opacity</label><span className="text-xs text-gray-500 font-mono">{settings.search_shadow_opacity}%</span></div>
                  <input type="range" min={0} max={100} value={settings.search_shadow_opacity} onChange={(e) => onChange({ search_shadow_opacity: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Backdrop Blur</label><span className="text-xs text-gray-500 font-mono">{settings.search_backdrop_blur}px</span></div>
                  <input type="range" min={0} max={20} value={settings.search_backdrop_blur} onChange={(e) => onChange({ search_backdrop_blur: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.search_text_color} onChange={(e) => onChange({ search_text_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
                    <input type="text" value={settings.search_text_color} onChange={(e) => onChange({ search_text_color: e.target.value })} className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Width</label><span className="text-xs text-gray-500 font-mono">{settings.search_width}px</span></div>
                  <input type="range" min={300} max={800} value={settings.search_width} onChange={(e) => onChange({ search_width: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Padding</label><span className="text-xs text-gray-500 font-mono">{settings.search_padding}px</span></div>
                  <input type="range" min={0} max={20} value={settings.search_padding} onChange={(e) => onChange({ search_padding: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Shortcuts */}
      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Shortcuts
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_shortcuts}
              onChange={(e) => onChange({ show_shortcuts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-600 peer-checked:bg-primary rounded-full peer-focus:ring-2 peer-focus:ring-primary/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>
        {settings.show_shortcuts && (
          <div className="space-y-3">
            <div className="space-y-2">
              {settings.shortcuts.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-sidebar/50 border border-border-subtle/30 group"
                >
                  <GripVertical size={14} className="text-gray-600 shrink-0" />
                  {editingShortcut === i ? (
                    <>
                      <input
                        value={s.icon}
                        onChange={(e) => updateShortcut(i, 'icon', e.target.value)}
                        className="w-10 px-1 py-1 bg-sidebar border border-border-subtle/50 rounded text-center text-sm"
                        maxLength={2}
                      />
                      <input
                        value={s.title}
                        onChange={(e) => updateShortcut(i, 'title', e.target.value)}
                        className="flex-1 px-2 py-1 bg-sidebar border border-border-subtle/50 rounded text-xs text-gray-200"
                        placeholder="Title"
                      />
                      <input
                        value={s.url}
                        onChange={(e) => updateShortcut(i, 'url', e.target.value)}
                        className="flex-[2] px-2 py-1 bg-sidebar border border-border-subtle/50 rounded text-xs text-gray-200 font-mono"
                        placeholder="https://..."
                      />
                      <button
                        onClick={() => setEditingShortcut(null)}
                        className="text-xs text-primary px-2 py-1 hover:bg-primary/10 rounded"
                      >
                        Done
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm w-6 text-center">{s.icon}</span>
                      <span className="flex-1 text-xs text-gray-300 truncate">{s.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">
                        {s.url}
                      </span>
                      <button
                        onClick={() => setEditingShortcut(i)}
                        className="text-xs text-gray-400 hover:text-primary px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeShortcut(i)}
                        className="text-gray-400 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {settings.shortcuts.length < 8 && (
                <button
                  onClick={addShortcut}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-primary border border-dashed border-border-subtle/50 hover:border-primary/50 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Add Shortcut
                </button>
              )}
            </div>

            <AdvancedToggle
              sectionKey="shortcuts"
              expanded={!!expandedSections['shortcuts']}
              onToggle={toggleSection}
            />
            {expandedSections['shortcuts'] && (
              <div className="space-y-4 pl-3 border-l-2 border-border-subtle/30">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.shortcuts_bg_color}
                      onChange={(e) => onChange({ shortcuts_bg_color: e.target.value })}
                      className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.shortcuts_bg_color}
                      onChange={(e) => onChange({ shortcuts_bg_color: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Opacity</label>
                    <span className="text-xs text-gray-500 font-mono">{settings.shortcuts_bg_opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.shortcuts_bg_opacity}
                    onChange={(e) => onChange({ shortcuts_bg_opacity: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-400">Border Radius</label>
                    <span className="text-xs text-gray-500 font-mono">{settings.shortcuts_border_radius}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={settings.shortcuts_border_radius}
                    onChange={(e) => onChange({ shortcuts_border_radius: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Columns</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {columnsOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onChange({ shortcuts_columns: opt.id })}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          settings.shortcuts_columns === opt.id
                            ? 'bg-primary text-white'
                            : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Gap</label><span className="text-xs text-gray-500 font-mono">{settings.shortcuts_gap}px</span></div>
                  <input type="range" min={4} max={32} value={settings.shortcuts_gap} onChange={(e) => onChange({ shortcuts_gap: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Shape</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {shapeOptions.map((opt) => (
                      <button key={opt.id} onClick={() => onChange({ shortcuts_shape: opt.id })} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings.shortcuts_shape === opt.id ? 'bg-primary text-white' : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Border Style</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {borderStyleOptions.map((opt) => (
                      <button key={opt.id} onClick={() => onChange({ shortcuts_border_style: opt.id })} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${settings.shortcuts_border_style === opt.id ? 'bg-primary text-white' : 'bg-sidebar border border-border-subtle/50 text-gray-300 hover:bg-white/5'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                {settings.shortcuts_border_style !== 'none' && (<>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Border Width</label><span className="text-xs text-gray-500 font-mono">{settings.shortcuts_border_width}px</span></div>
                    <input type="range" min={0} max={5} value={settings.shortcuts_border_width} onChange={(e) => onChange({ shortcuts_border_width: Number(e.target.value) })} className="w-full accent-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.shortcuts_border_color} onChange={(e) => onChange({ shortcuts_border_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
                      <input type="text" value={settings.shortcuts_border_color} onChange={(e) => onChange({ shortcuts_border_color: e.target.value })} className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono" />
                    </div>
                  </div>
                </>)}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Shadow Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.shortcuts_shadow_color} onChange={(e) => onChange({ shortcuts_shadow_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
                    <input type="text" value={settings.shortcuts_shadow_color} onChange={(e) => onChange({ shortcuts_shadow_color: e.target.value })} className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Shadow Blur</label><span className="text-xs text-gray-500 font-mono">{settings.shortcuts_shadow_blur}px</span></div>
                  <input type="range" min={0} max={40} value={settings.shortcuts_shadow_blur} onChange={(e) => onChange({ shortcuts_shadow_blur: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Shadow Opacity</label><span className="text-xs text-gray-500 font-mono">{settings.shortcuts_shadow_opacity}%</span></div>
                  <input type="range" min={0} max={100} value={settings.shortcuts_shadow_opacity} onChange={(e) => onChange({ shortcuts_shadow_opacity: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Backdrop Blur</label><span className="text-xs text-gray-500 font-mono">{settings.shortcuts_backdrop_blur}px</span></div>
                  <input type="range" min={0} max={20} value={settings.shortcuts_backdrop_blur} onChange={(e) => onChange({ shortcuts_backdrop_blur: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Title Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={settings.shortcuts_title_color} onChange={(e) => onChange({ shortcuts_title_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
                    <input type="text" value={settings.shortcuts_title_color} onChange={(e) => onChange({ shortcuts_title_color: e.target.value })} className="flex-1 px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Icon Size</label><span className="text-xs text-gray-500 font-mono">{settings.shortcuts_icon_size}px</span></div>
                  <input type="range" min={16} max={64} value={settings.shortcuts_icon_size} onChange={(e) => onChange({ shortcuts_icon_size: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Padding X</label><span className="text-xs text-gray-500 font-mono">{settings.shortcuts_padding_x}px</span></div>
                  <input type="range" min={0} max={30} value={settings.shortcuts_padding_x} onChange={(e) => onChange({ shortcuts_padding_x: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><label className="text-xs text-gray-400">Padding Y</label><span className="text-xs text-gray-500 font-mono">{settings.shortcuts_padding_y}px</span></div>
                  <input type="range" min={0} max={30} value={settings.shortcuts_padding_y} onChange={(e) => onChange({ shortcuts_padding_y: Number(e.target.value) })} className="w-full accent-primary" />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Custom CSS */}
      <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Custom CSS
        </h3>
        <textarea
          value={settings.custom_css}
          onChange={(e) => onChange({ custom_css: e.target.value })}
          placeholder="/* Your custom styles here */"
          rows={6}
          className="w-full px-3 py-2 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs font-mono resize-y"
        />
        <p className="mt-2 text-[10px] text-gray-500">
          Advanced: appended to the generated styles
        </p>
      </section>
    </div>
  );
}
