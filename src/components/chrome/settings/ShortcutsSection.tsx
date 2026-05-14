import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Folder, GripVertical, Link, Plus, Trash2 } from 'lucide-react';
import { useT } from '../../../i18n';
import type { BrowserSettings, Shortcut } from '../../../types';
import { borderStyleOptions, columnsOptions, shapeOptions } from './Options';
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
  const [editingShortcut, setEditingShortcut] = useState<number | null>(null);
  const [openFolderIndex, setOpenFolderIndex] = useState<number | null>(null);

  const updateShortcut = (index: number, field: keyof Shortcut, value: string) => {
    const updated = [...settings.shortcuts];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ shortcuts: updated });
  };

  const addShortcut = () => {
    onChange({
      shortcuts: [
        ...settings.shortcuts,
        { kind: 'link', title: 'New', url: 'https://', icon: '\uD83D\uDD17' },
      ],
    });
    setEditingShortcut(settings.shortcuts.length);
  };

  const addFolder = () => {
    onChange({
      shortcuts: [
        ...settings.shortcuts,
        { kind: 'folder', title: 'Folder', icon: '\uD83D\uDCC1', children: [] },
      ],
    });
    setOpenFolderIndex(settings.shortcuts.length);
  };

  const removeShortcut = (index: number) => {
    onChange({ shortcuts: settings.shortcuts.filter((_, shortcutIndex) => shortcutIndex !== index) });
    setEditingShortcut(null);
    setOpenFolderIndex(null);
  };

  const moveShortcut = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= settings.shortcuts.length) return;
    const updated = [...settings.shortcuts];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange({ shortcuts: updated });
  };

  const updateFolderChild = (folderIndex: number, childIndex: number, field: keyof Shortcut, value: string) => {
    const updated = [...settings.shortcuts];
    const folder = updated[folderIndex];
    const children = [...(folder.children ?? [])];
    children[childIndex] = { ...children[childIndex], [field]: value };
    updated[folderIndex] = { ...folder, children };
    onChange({ shortcuts: updated });
  };

  const addFolderChild = (folderIndex: number) => {
    const updated = [...settings.shortcuts];
    const folder = updated[folderIndex];
    updated[folderIndex] = {
      ...folder,
      children: [
        ...(folder.children ?? []),
        { kind: 'link', title: 'New', url: 'https://', icon: '\uD83D\uDD17' },
      ],
    };
    onChange({ shortcuts: updated });
  };

  const removeFolderChild = (folderIndex: number, childIndex: number) => {
    const updated = [...settings.shortcuts];
    const folder = updated[folderIndex];
    updated[folderIndex] = {
      ...folder,
      children: (folder.children ?? []).filter((_, index) => index !== childIndex),
    };
    onChange({ shortcuts: updated });
  };

  const openFolder = openFolderIndex !== null ? settings.shortcuts[openFolderIndex] : null;

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
          {openFolder && openFolderIndex !== null ? (
            <div className="space-y-2">
              <button
                onClick={() => setOpenFolderIndex(null)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary"
              >
                <ArrowLeft size={14} />
                {t('settings.backToShortcuts')}
              </button>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar/50 border border-border-subtle/30">
                <input
                  value={openFolder.icon}
                  onChange={(e) => updateShortcut(openFolderIndex, 'icon', e.target.value)}
                  className="w-10 px-1 py-1 bg-sidebar border border-border-subtle/50 rounded text-center text-sm"
                  maxLength={2}
                />
                <input
                  value={openFolder.title}
                  onChange={(e) => updateShortcut(openFolderIndex, 'title', e.target.value)}
                  className="flex-1 px-2 py-1 bg-sidebar border border-border-subtle/50 rounded text-xs text-gray-200"
                  placeholder="Folder"
                />
              </div>
              {(openFolder.children ?? []).map((child, childIndex) => (
                <div
                  key={`${child.title}-${childIndex}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-sidebar/50 border border-border-subtle/30"
                >
                  <input
                    value={child.icon}
                    onChange={(e) => updateFolderChild(openFolderIndex, childIndex, 'icon', e.target.value)}
                    className="w-10 px-1 py-1 bg-sidebar border border-border-subtle/50 rounded text-center text-sm"
                    maxLength={2}
                  />
                  <input
                    value={child.title}
                    onChange={(e) => updateFolderChild(openFolderIndex, childIndex, 'title', e.target.value)}
                    className="flex-1 px-2 py-1 bg-sidebar border border-border-subtle/50 rounded text-xs text-gray-200"
                    placeholder="Title"
                  />
                  <input
                    value={child.url ?? ''}
                    onChange={(e) => updateFolderChild(openFolderIndex, childIndex, 'url', e.target.value)}
                    className="flex-[2] px-2 py-1 bg-sidebar border border-border-subtle/50 rounded text-xs text-gray-200 font-mono"
                    placeholder="https://..."
                  />
                  <button
                    onClick={() => removeFolderChild(openFolderIndex, childIndex)}
                    aria-label={t('settings.deleteShortcut')}
                    className="text-gray-400 hover:text-red-400 p-0.5"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {(openFolder.children ?? []).length < 16 && (
                <button
                  onClick={() => addFolderChild(openFolderIndex)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-primary border border-dashed border-border-subtle/50 hover:border-primary/50 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  {t('settings.addShortcut')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {settings.shortcuts.map((shortcut, index) => {
                const isFolder = shortcut.kind === 'folder';
                return (
                  <div
                    key={`${shortcut.title}-${index}`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-sidebar/50 border border-border-subtle/30 group"
                  >
                    <GripVertical size={14} className="text-gray-600 shrink-0" />
                    {editingShortcut === index ? (
                      <>
                        <input
                          value={shortcut.icon}
                          onChange={(e) => updateShortcut(index, 'icon', e.target.value)}
                          className="w-10 px-1 py-1 bg-sidebar border border-border-subtle/50 rounded text-center text-sm"
                          maxLength={2}
                        />
                        <input
                          value={shortcut.title}
                          onChange={(e) => updateShortcut(index, 'title', e.target.value)}
                          className="flex-1 px-2 py-1 bg-sidebar border border-border-subtle/50 rounded text-xs text-gray-200"
                          placeholder="Title"
                        />
                        {!isFolder && (
                          <input
                            value={shortcut.url ?? ''}
                            onChange={(e) => updateShortcut(index, 'url', e.target.value)}
                            className="flex-[2] px-2 py-1 bg-sidebar border border-border-subtle/50 rounded text-xs text-gray-200 font-mono"
                            placeholder="https://..."
                          />
                        )}
                        <button
                          onClick={() => setEditingShortcut(null)}
                          className="text-xs text-primary px-2 py-1 hover:bg-primary/10 rounded"
                        >
                          {t('common.done')}
                        </button>
                      </>
                    ) : (
                      <>
                        {isFolder ? <Folder size={14} className="text-yellow-400" /> : <Link size={14} className="text-blue-400" />}
                        <span className="text-sm w-6 text-center">{shortcut.icon}</span>
                        <button
                          onClick={() => (isFolder ? setOpenFolderIndex(index) : setEditingShortcut(index))}
                          className="flex-1 text-left text-xs text-gray-300 hover:text-primary truncate"
                        >
                          {shortcut.title}
                        </button>
                        <span className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">
                          {isFolder ? `${shortcut.children?.length ?? 0} ${t('settings.link')}` : shortcut.url}
                        </span>
                        <button
                          onClick={() => moveShortcut(index, -1)}
                          disabled={index === 0}
                          aria-label={t('settings.moveUp')}
                          className="text-gray-400 hover:text-primary p-0.5 disabled:opacity-30"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => moveShortcut(index, 1)}
                          disabled={index === settings.shortcuts.length - 1}
                          aria-label={t('settings.moveDown')}
                          className="text-gray-400 hover:text-primary p-0.5 disabled:opacity-30"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          onClick={() => setEditingShortcut(index)}
                          className="text-xs text-gray-400 hover:text-primary px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => removeShortcut(index)}
                          aria-label={t('settings.deleteShortcut')}
                          className="text-gray-400 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
              {settings.shortcuts.length < 16 && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={addShortcut}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-primary border border-dashed border-border-subtle/50 hover:border-primary/50 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                    {t('settings.addShortcut')}
                  </button>
                  <button
                    onClick={addFolder}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-primary border border-dashed border-border-subtle/50 hover:border-primary/50 rounded-lg transition-colors"
                  >
                    <Folder size={14} />
                    {t('settings.addFolder')}
                  </button>
                </div>
              )}
            </div>
          )}

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
