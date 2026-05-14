import type { BrowserSettings } from '../../../types';
import { useT } from '../../../i18n';
import { ImagePicker } from '../../common/ImagePicker';
import { backgroundFitOptions, gradientDirectionOptions } from './Options';
import { AdvancedToggle, CapabilityBadge, ColorField, OptionButtons, RangeField, ToggleSwitch } from './Shared';

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
  const background = settings.theme.background;
  const updateBackground = (partial: Partial<typeof background>) => {
    onChange({
      theme: {
        ...settings.theme,
        background: {
          ...background,
          ...partial,
        },
      },
    });
  };

  return (
    <section className="bg-card border border-border-subtle/40 rounded-xl p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('settings.background')}
        </h3>
        <CapabilityBadge level="full" />
      </div>
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
            value={background.overlay_opacity}
            min={0}
            max={80}
            suffix="%"
            onChange={(value) => updateBackground({ overlay_opacity: value })}
          />
          <ColorField
            label={t('settings.overlayColor')}
            value={background.overlay_color}
            onChange={(value) => updateBackground({ overlay_color: value })}
          />
        </div>
      )}

      {!settings.background_image && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">{t('settings.gradient')}</label>
            <ToggleSwitch
              checked={background.gradient_enabled}
              onChange={(checked) => updateBackground({ gradient_enabled: checked })}
            />
          </div>
          {background.gradient_enabled && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ColorField
                  label={t('settings.gradientFrom')}
                  value={background.gradient_from}
                  onChange={(value) => updateBackground({ gradient_from: value })}
                />
                <ColorField
                  label={t('settings.gradientTo')}
                  value={background.gradient_to}
                  onChange={(value) => updateBackground({ gradient_to: value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-2">{t('settings.gradientDirection')}</label>
                <OptionButtons
                  value={background.gradient_direction}
                  options={gradientDirectionOptions}
                  onChange={(value) => updateBackground({ gradient_direction: value })}
                  columns="grid grid-cols-2 lg:grid-cols-4 gap-1.5"
                />
              </div>
            </>
          )}
        </div>
      )}

      <AdvancedToggle sectionKey="background" expanded={expanded} onToggle={onToggle} />
      {expanded && (
        <div className="mt-3 space-y-4 pl-3 border-l-2 border-border-subtle/30">
          {!settings.background_image && !background.gradient_enabled && (
            <ColorField
              label={t('settings.bgColorLabel')}
              value={background.color}
              onChange={(value) => updateBackground({ color: value })}
            />
          )}
          <div>
            <label className="text-xs text-gray-400 block mb-2">{t('settings.fit')}</label>
            <OptionButtons
              value={background.fit}
              options={backgroundFitOptions}
              onChange={(value) => updateBackground({ fit: value })}
              columns="grid grid-cols-2 lg:grid-cols-4 gap-1.5"
            />
          </div>
          <RangeField
            label={t('settings.blur')}
            value={background.blur}
            min={0}
            max={20}
            suffix="px"
            onChange={(value) => updateBackground({ blur: value })}
          />
          <RangeField
            label={t('settings.brightness')}
            value={background.brightness}
            min={50}
            max={150}
            suffix="%"
            onChange={(value) => updateBackground({ brightness: value })}
          />
        </div>
      )}
    </section>
  );
}
