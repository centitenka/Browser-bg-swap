import type { LocaleKeys } from '../i18n/en';
import type { AppWarning } from '../types';

type Translate = (key: LocaleKeys, vars?: Record<string, string>) => string;

const projectedFieldKeys: Record<string, LocaleKeys> = {
  show_clock: 'warning.field.showClock',
  clock_color: 'warning.field.clock',
  clock_size: 'warning.field.clock',
  clock_format_24h: 'warning.field.clock',
  clock_show_seconds: 'warning.field.clock',
  clock_show_date: 'warning.field.clock',
  clock_font_weight: 'warning.field.clock',
  clock_shadow_color: 'warning.field.clock',
  clock_shadow_blur: 'warning.field.clock',
  clock_shadow_opacity: 'warning.field.clock',
  clock_letter_spacing: 'warning.field.clock',
  clock_font_family: 'warning.field.clock',
  search_engine: 'warning.field.searchEngine',
  search_placeholder: 'warning.field.searchAppearance',
  search_width: 'warning.field.searchAppearance',
  search_padding: 'warning.field.searchAppearance',
  search_position: 'warning.field.searchPosition',
  shortcuts: 'warning.field.shortcutsItems',
  shortcuts_columns: 'warning.field.shortcutsAppearance',
  shortcuts_gap: 'warning.field.shortcutsAppearance',
  shortcuts_icon_size: 'warning.field.shortcutsAppearance',
  shortcuts_padding_x: 'warning.field.shortcutsAppearance',
  shortcuts_padding_y: 'warning.field.shortcutsAppearance',
  shortcuts_shape: 'warning.field.shortcutsAppearance',
  shortcuts_position: 'warning.field.shortcutsPosition',
  custom_css: 'warning.field.customCss',
};

function formatProjectedFields(t: Translate, details: string[] | undefined): string {
  if (!details || details.length === 0) {
    return t('warning.field.unsupportedSettings');
  }

  return details
    .map((detail) => t(projectedFieldKeys[detail] ?? 'warning.field.unsupportedSettings'))
    .filter((value, index, items) => items.indexOf(value) === index)
    .join(', ');
}

export function formatWarningMessage(t: Translate, warning: AppWarning): string {
  switch (warning.code) {
    case 'firefox_restart_required':
      return t('warning.firefoxRestartRequired');
    case 'extension_manual_install_required':
      return t('warning.extensionManualInstallRequired');
    case 'extension_reload_required':
      return t('warning.extensionReloadRequired');
    case 'background_image_copied':
      return t('warning.backgroundImageCopied');
    case 'bundle_invalid':
      return t('warning.bundleInvalid');
    case 'import_trimmed_fields':
      return t('warning.importTrimmedFields', {
        fields: formatProjectedFields(t, warning.details),
      });
    default:
      return warning.message;
  }
}
