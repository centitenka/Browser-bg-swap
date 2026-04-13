import { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useT } from '../../../i18n';
import type { BrowserSettings, Shortcut } from '../../../types';
import { getBorderStyleOptions, getColumnsOptions, getShapeOptions } from './Options';
import {
  AdvancedToggle,
  ColorField,
  OptionButtons,
  RangeField,
  ToggleSwitch,
} from './Shared';

interface ShortcutsSectionProps {
  settings: BrowserSettings;
  expanded: boolean;
  onToggle: (key: string) => void;
  onChange: (settings: Partial<BrowserSettings>) => void;
}

export function ShortcutsSection({
  settings,
  expanded,
  onToggle,
  onChange,
}: ShortcutsSectionProps) {
  const t = useT();
  const borderStyleOptions = getBorderStyleOptions(t);
  const columnsOptions = getColumnsOptions(t);
  const shapeOptions = getShapeOptions(t);
  const [editingShortcut, setEditingShortcut] = useState<number | null>(null);

  const updateShortcut = (index: number, field: keyof Shortcut, value: string) => {
    const updated = [...settings.shortcuts];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ shortcuts: updated });
  };

  const addShortcut = () => {
    onChange({
      shortcuts: [...settings.shortcuts, { title: t('shortcut.defaultTitle'), url: 'https://', icon: '\uD83D\uDD17' }],
    });
    setEditingShortcut(settings.shortcuts.length);
  };

  const removeShortcut = (index: number) => {
    onChange({ shortcuts: settings.shortcuts.filter((_, shortcutIndex) => shortcutIndex !== index) });
    setEditingShortcut(null);
  };

  return (
    <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('settings.shortcuts')}
        </h3>
        <ToggleSwitch
          checked={settings.show_shortcuts}
          onChange={(checked) => onChange({ show_shortcuts: checked })}
        />
      </div>
      {settings.show_shortcuts && (
        <div className="space-y-3">
          <div className="space-y-2">
            {settings.shortcuts.map((shortcut, index) => (
              <div
                key={`${shortcut.title}-${index}`}
                className="group flex flex-wrap items-center gap-2 rounded-lg border border-border-subtle/30 bg-sidebar/50 p-2"
              >
                <GripVertical size={14} className="text-gray-600 shrink-0" />
                {editingShortcut === index ? (
                  <>
                    <input
                      value={shortcut.icon}
                      onChange={(e) => updateShortcut(index, 'icon', e.target.value)}
                      className="w-10 shrink-0 rounded border border-border-subtle/50 bg-sidebar px-1 py-1 text-center text-sm"
                      maxLength={2}
                    />
                    <input
                      value={shortcut.title}
                      onChange={(e) => updateShortcut(index, 'title', e.target.value)}
                      className="min-w-0 basis-full rounded border border-border-subtle/50 bg-sidebar px-2 py-1 text-xs text-gray-200 sm:basis-[180px] sm:flex-1"
                      placeholder={t('shortcut.titlePlaceholder')}
                    />
                    <input
                      value={shortcut.url}
                      onChange={(e) => updateShortcut(index, 'url', e.target.value)}
                      className="min-w-0 basis-full rounded border border-border-subtle/50 bg-sidebar px-2 py-1 font-mono text-xs text-gray-200 lg:basis-[220px] lg:flex-[2]"
                      placeholder={t('shortcut.urlPlaceholder')}
                    />
                    <button
                      onClick={() => setEditingShortcut(null)}
                      className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
                    >
                      {t('common.done')}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-6 shrink-0 text-center text-sm">{shortcut.icon}</span>
                    <span className="min-w-0 flex-1 basis-[120px] truncate text-xs text-gray-300">{shortcut.title}</span>
                    <span className="min-w-0 basis-full truncate font-mono text-[10px] text-gray-500 sm:basis-[140px] sm:flex-1">
                      {shortcut.url}
                    </span>
                    <button
                      onClick={() => setEditingShortcut(index)}
                      className="rounded px-1.5 py-0.5 text-xs text-gray-400 opacity-100 transition-opacity hover:text-primary sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      onClick={() => removeShortcut(index)}
                      className="p-0.5 text-gray-400 opacity-100 transition-opacity hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
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
                {t('settings.addShortcut')}
              </button>
            )}
          </div>

          <AdvancedToggle sectionKey="shortcuts" expanded={expanded} onToggle={onToggle} />
          {expanded && (
            <div className="space-y-4 pl-3 border-l-2 border-border-subtle/30">
              <ColorField
                label={t('settings.bgColorLabel')}
                value={settings.shortcuts_bg_color}
                onChange={(value) => onChange({ shortcuts_bg_color: value })}
              />
              <RangeField
                label={t('settings.opacity')}
                value={settings.shortcuts_bg_opacity}
                min={0}
                max={100}
                suffix="%"
                onChange={(value) => onChange({ shortcuts_bg_opacity: value })}
              />
              <RangeField
                label={t('settings.borderRadius')}
                value={settings.shortcuts_border_radius}
                min={0}
                max={50}
                suffix="px"
                onChange={(value) => onChange({ shortcuts_border_radius: value })}
              />
              <div>
                <label className="text-xs text-gray-400 block mb-2">{t('settings.columns')}</label>
                <OptionButtons
                  value={settings.shortcuts_columns}
                  options={columnsOptions}
                  onChange={(value) => onChange({ shortcuts_columns: value })}
                  columns="grid grid-cols-3 lg:grid-cols-6 gap-1.5"
                />
              </div>
              <RangeField
                label={t('settings.gap')}
                value={settings.shortcuts_gap}
                min={4}
                max={32}
                suffix="px"
                onChange={(value) => onChange({ shortcuts_gap: value })}
              />
              <div>
                <label className="text-xs text-gray-400 block mb-2">{t('settings.shape')}</label>
                <OptionButtons
                  value={settings.shortcuts_shape}
                  options={shapeOptions}
                  onChange={(value) => onChange({ shortcuts_shape: value })}
                  columns="grid grid-cols-3 gap-1.5"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">{t('settings.borderStyle')}</label>
                <OptionButtons
                  value={settings.shortcuts_border_style}
                  options={borderStyleOptions}
                  onChange={(value) => onChange({ shortcuts_border_style: value })}
                  columns="grid grid-cols-2 lg:grid-cols-4 gap-1.5"
                />
              </div>
              {settings.shortcuts_border_style !== 'none' && (
                <>
                  <RangeField
                    label={t('settings.borderWidth')}
                    value={settings.shortcuts_border_width}
                    min={0}
                    max={5}
                    suffix="px"
                    onChange={(value) => onChange({ shortcuts_border_width: value })}
                  />
                  <ColorField
                    label={t('settings.borderColor')}
                    value={settings.shortcuts_border_color}
                    onChange={(value) => onChange({ shortcuts_border_color: value })}
                  />
                </>
              )}
              <ColorField
                label={t('settings.shadowColor')}
                value={settings.shortcuts_shadow_color}
                onChange={(value) => onChange({ shortcuts_shadow_color: value })}
              />
              <RangeField
                label={t('settings.shadowBlur')}
                value={settings.shortcuts_shadow_blur}
                min={0}
                max={40}
                suffix="px"
                onChange={(value) => onChange({ shortcuts_shadow_blur: value })}
              />
              <RangeField
                label={t('settings.shadowOpacity')}
                value={settings.shortcuts_shadow_opacity}
                min={0}
                max={100}
                suffix="%"
                onChange={(value) => onChange({ shortcuts_shadow_opacity: value })}
              />
              <RangeField
                label={t('settings.backdropBlur')}
                value={settings.shortcuts_backdrop_blur}
                min={0}
                max={20}
                suffix="px"
                onChange={(value) => onChange({ shortcuts_backdrop_blur: value })}
              />
              <ColorField
                label={t('settings.titleColor')}
                value={settings.shortcuts_title_color}
                onChange={(value) => onChange({ shortcuts_title_color: value })}
              />
              <RangeField
                label={t('settings.iconSize')}
                value={settings.shortcuts_icon_size}
                min={16}
                max={64}
                suffix="px"
                onChange={(value) => onChange({ shortcuts_icon_size: value })}
              />
              <RangeField
                label={t('settings.paddingX')}
                value={settings.shortcuts_padding_x}
                min={0}
                max={30}
                suffix="px"
                onChange={(value) => onChange({ shortcuts_padding_x: value })}
              />
              <RangeField
                label={t('settings.paddingY')}
                value={settings.shortcuts_padding_y}
                min={0}
                max={30}
                suffix="px"
                onChange={(value) => onChange({ shortcuts_padding_y: value })}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
