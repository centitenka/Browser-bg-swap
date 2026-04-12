import { useT } from '../../../i18n';
import type { BrowserSettings } from '../../../types';
import { fontFamilyOptions, fontWeightOptions } from './Options';
import {
  AdvancedToggle,
  ColorField,
  OptionButtons,
  RangeField,
  ToggleSwitch,
} from './Shared';

interface ClockSectionProps {
  settings: BrowserSettings;
  expanded: boolean;
  onToggle: (key: string) => void;
  onChange: (settings: Partial<BrowserSettings>) => void;
}

export function ClockSection({
  settings,
  expanded,
  onToggle,
  onChange,
}: ClockSectionProps) {
  const t = useT();

  return (
    <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('settings.clock')}</h3>
        <ToggleSwitch checked={settings.show_clock} onChange={(checked) => onChange({ show_clock: checked })} />
      </div>
      {settings.show_clock && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ColorField
                label={t('settings.color')}
                value={settings.clock_color}
                onChange={(value) => onChange({ clock_color: value })}
              />
            </div>
            <div className="flex-1">
              <RangeField
                label={t('settings.size')}
                value={settings.clock_size}
                min={32}
                max={120}
                suffix="px"
                onChange={(value) => onChange({ clock_size: value })}
              />
            </div>
          </div>

          <AdvancedToggle sectionKey="clock" expanded={expanded} onToggle={onToggle} />
          {expanded && (
            <div className="space-y-4 pl-3 border-l-2 border-border-subtle/30">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">{t('settings.format24h')}</label>
                <ToggleSwitch
                  checked={settings.clock_format_24h}
                  onChange={(checked) => onChange({ clock_format_24h: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">{t('settings.showSeconds')}</label>
                <ToggleSwitch
                  checked={settings.clock_show_seconds}
                  onChange={(checked) => onChange({ clock_show_seconds: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">{t('settings.showDate')}</label>
                <ToggleSwitch
                  checked={settings.clock_show_date}
                  onChange={(checked) => onChange({ clock_show_date: checked })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">{t('settings.fontWeight')}</label>
                <OptionButtons
                  value={settings.clock_font_weight}
                  options={fontWeightOptions}
                  onChange={(value) => onChange({ clock_font_weight: value })}
                  columns="grid grid-cols-3 gap-1.5"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">{t('settings.fontFamily')}</label>
                <OptionButtons
                  value={settings.clock_font_family}
                  options={fontFamilyOptions}
                  onChange={(value) => onChange({ clock_font_family: value })}
                  columns="grid grid-cols-3 gap-1.5"
                />
              </div>
              <ColorField
                label={t('settings.shadowColor')}
                value={settings.clock_shadow_color}
                onChange={(value) => onChange({ clock_shadow_color: value })}
              />
              <RangeField
                label={t('settings.shadowBlur')}
                value={settings.clock_shadow_blur}
                min={0}
                max={30}
                suffix="px"
                onChange={(value) => onChange({ clock_shadow_blur: value })}
              />
              <RangeField
                label={t('settings.shadowOpacity')}
                value={settings.clock_shadow_opacity}
                min={0}
                max={100}
                suffix="%"
                onChange={(value) => onChange({ clock_shadow_opacity: value })}
              />
              <RangeField
                label={t('settings.letterSpacing')}
                value={settings.clock_letter_spacing}
                min={-10}
                max={20}
                suffix="px"
                onChange={(value) => onChange({ clock_letter_spacing: value })}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
