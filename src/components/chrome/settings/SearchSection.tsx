import { useT } from '../../../i18n';
import type { BrowserSettings } from '../../../types';
import { getBorderStyleOptions, getSearchEngines } from './Options';
import {
  AdvancedToggle,
  ColorField,
  OptionButtons,
  RangeField,
  ToggleSwitch,
} from './Shared';

interface SearchSectionProps {
  settings: BrowserSettings;
  expanded: boolean;
  onToggle: (key: string) => void;
  onChange: (settings: Partial<BrowserSettings>) => void;
}

export function SearchSection({
  settings,
  expanded,
  onToggle,
  onChange,
}: SearchSectionProps) {
  const t = useT();
  const borderStyleOptions = getBorderStyleOptions(t);
  const searchEngines = getSearchEngines(t);

  return (
    <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('settings.search')}</h3>
        <ToggleSwitch
          checked={settings.show_search_box}
          onChange={(checked) => onChange({ show_search_box: checked })}
        />
      </div>
      {settings.show_search_box && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-2">{t('settings.searchEngine')}</label>
            <OptionButtons
              value={settings.search_engine}
              options={searchEngines}
              onChange={(value) => onChange({ search_engine: value })}
              columns="grid grid-cols-2 lg:grid-cols-5 gap-1.5"
            />
          </div>

          {settings.search_engine === 'custom' && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-4">
              <label className="mb-2 block text-xs text-amber-100">{t('settings.searchUrlTemplate')}</label>
              <input
                type="text"
                value={settings.search_url_template}
                onChange={(e) => onChange({ search_url_template: e.target.value })}
                placeholder={t('settings.searchUrlTemplatePlaceholder')}
                className="w-full rounded-lg border border-border-subtle/50 bg-sidebar/50 px-3 py-2 text-xs font-mono text-gray-200"
              />
              <p className="mt-2 text-[11px] leading-5 text-amber-100/80">
                {t('settings.searchUrlTemplateHint')}
              </p>
            </div>
          )}

          <AdvancedToggle sectionKey="search" expanded={expanded} onToggle={onToggle} />
          {expanded && (
            <div className="space-y-4 pl-3 border-l-2 border-border-subtle/30">
              <ColorField
                label={t('settings.bgColorLabel')}
                value={settings.search_bg_color}
                onChange={(value) => onChange({ search_bg_color: value })}
              />
              <RangeField
                label={t('settings.opacity')}
                value={settings.search_bg_opacity}
                min={0}
                max={100}
                suffix="%"
                onChange={(value) => onChange({ search_bg_opacity: value })}
              />
              <RangeField
                label={t('settings.borderRadius')}
                value={settings.search_border_radius}
                min={0}
                max={50}
                suffix="px"
                onChange={(value) => onChange({ search_border_radius: value })}
              />
              <div>
                <label className="text-xs text-gray-400 block mb-1">{t('settings.placeholder')}</label>
                <input
                  type="text"
                  value={settings.search_placeholder}
                  onChange={(e) => onChange({ search_placeholder: e.target.value })}
                  className="w-full px-3 py-1.5 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">{t('settings.borderStyle')}</label>
                <OptionButtons
                  value={settings.search_border_style}
                  options={borderStyleOptions}
                  onChange={(value) => onChange({ search_border_style: value })}
                  columns="grid grid-cols-2 lg:grid-cols-4 gap-1.5"
                />
              </div>
              {settings.search_border_style !== 'none' && (
                <>
                  <RangeField
                    label={t('settings.borderWidth')}
                    value={settings.search_border_width}
                    min={0}
                    max={5}
                    suffix="px"
                    onChange={(value) => onChange({ search_border_width: value })}
                  />
                  <ColorField
                    label={t('settings.borderColor')}
                    value={settings.search_border_color}
                    onChange={(value) => onChange({ search_border_color: value })}
                  />
                </>
              )}
              <ColorField
                label={t('settings.shadowColor')}
                value={settings.search_shadow_color}
                onChange={(value) => onChange({ search_shadow_color: value })}
              />
              <RangeField
                label={t('settings.shadowBlur')}
                value={settings.search_shadow_blur}
                min={0}
                max={40}
                suffix="px"
                onChange={(value) => onChange({ search_shadow_blur: value })}
              />
              <RangeField
                label={t('settings.shadowOpacity')}
                value={settings.search_shadow_opacity}
                min={0}
                max={100}
                suffix="%"
                onChange={(value) => onChange({ search_shadow_opacity: value })}
              />
              <RangeField
                label={t('settings.backdropBlur')}
                value={settings.search_backdrop_blur}
                min={0}
                max={20}
                suffix="px"
                onChange={(value) => onChange({ search_backdrop_blur: value })}
              />
              <ColorField
                label={t('settings.textColor')}
                value={settings.search_text_color}
                onChange={(value) => onChange({ search_text_color: value })}
              />
              <RangeField
                label={t('settings.width')}
                value={settings.search_width}
                min={300}
                max={800}
                suffix="px"
                onChange={(value) => onChange({ search_width: value })}
              />
              <RangeField
                label={t('settings.padding')}
                value={settings.search_padding}
                min={0}
                max={20}
                suffix="px"
                onChange={(value) => onChange({ search_padding: value })}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
