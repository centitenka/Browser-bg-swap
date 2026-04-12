import type { BrowserSettings } from '../../../types';
import { useT } from '../../../i18n';
import { ImagePicker } from '../../common/ImagePicker';
import { backgroundFitOptions } from './Options';
import { AdvancedToggle, ColorField, OptionButtons, RangeField } from './Shared';

interface BackgroundSectionProps {
  settings: BrowserSettings;
  expanded: boolean;
  onToggle: (key: string) => void;
  onChange: (settings: Partial<BrowserSettings>) => void;
  onSelectImage: () => void;
}

export function BackgroundSection({
  settings,
  expanded,
  onToggle,
  onChange,
  onSelectImage,
}: BackgroundSectionProps) {
  const t = useT();

  return (
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
      {settings.background_image && (
        <div className="mt-4 space-y-4">
          <RangeField
            label={t('settings.overlayDarkness')}
            value={settings.overlay_opacity}
            min={0}
            max={80}
            suffix="%"
            onChange={(value) => onChange({ overlay_opacity: value })}
          />
          <ColorField
            label={t('settings.overlayColor')}
            value={settings.overlay_color}
            onChange={(value) => onChange({ overlay_color: value })}
          />
        </div>
      )}

      <AdvancedToggle sectionKey="background" expanded={expanded} onToggle={onToggle} />
      {expanded && (
        <div className="mt-3 space-y-4 pl-3 border-l-2 border-border-subtle/30">
          {!settings.background_image && (
            <ColorField
              label={t('settings.bgColorLabel')}
              value={settings.background_color}
              onChange={(value) => onChange({ background_color: value })}
            />
          )}
          <div>
            <label className="text-xs text-gray-400 block mb-2">{t('settings.fit')}</label>
            <OptionButtons
              value={settings.background_fit}
              options={backgroundFitOptions}
              onChange={(value) => onChange({ background_fit: value })}
              columns="grid grid-cols-2 lg:grid-cols-4 gap-1.5"
            />
          </div>
          <RangeField
            label={t('settings.blur')}
            value={settings.background_blur}
            min={0}
            max={20}
            suffix="px"
            onChange={(value) => onChange({ background_blur: value })}
          />
          <RangeField
            label={t('settings.brightness')}
            value={settings.background_brightness}
            min={50}
            max={150}
            suffix="%"
            onChange={(value) => onChange({ background_brightness: value })}
          />
        </div>
      )}
    </section>
  );
}
