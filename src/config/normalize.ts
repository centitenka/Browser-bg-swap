import { browserCapabilities } from './capabilities';
import { CONFIG_VERSION, createDefaultAppConfig, createDefaultSettings } from './defaults';
import type {
  AppliedSettingsSnapshot,
  AppWarning,
  AppConfig,
  BrowserSettings,
  BrowserTab,
  ElementPosition,
  SettingsExchangeFile,
  Shortcut,
} from '../types';

const colorPattern = /^#[0-9a-f]{6}$/i;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function normalizeColor(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized && colorPattern.test(normalized) ? normalized.toLowerCase() : fallback;
}

function normalizeEnum(value: string | null | undefined, allowed: string[], fallback: string): string {
  const normalized = value?.trim().toLowerCase();
  return normalized && allowed.includes(normalized) ? normalized : fallback;
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizePresetBrowser(value: string | null | undefined): BrowserTab {
  return value?.trim().toLowerCase() === 'firefox' ? 'firefox' : 'chrome';
}

function normalizePosition(value: ElementPosition | null | undefined, fallback: ElementPosition): ElementPosition {
  if (!value) {
    return { ...fallback };
  }

  return {
    x: clamp(value.x, 5, 95),
    y: clamp(value.y, 5, 95),
  };
}

function normalizeShortcuts(shortcuts: Shortcut[] | null | undefined, fallback: Shortcut[]): Shortcut[] {
  const normalized = (shortcuts ?? [])
    .map((shortcut) => ({
      title: shortcut.title?.trim() ?? '',
      url: shortcut.url?.trim() ?? '',
      icon: shortcut.icon?.trim() || '\uD83D\uDD17',
      position: shortcut.position ? normalizePosition(shortcut.position, { x: 50, y: 68 }) : undefined,
    }))
    .filter((shortcut) => shortcut.title && shortcut.url)
    .slice(0, 8);

  return normalized.length > 0 ? normalized : fallback.map((shortcut) => ({ ...shortcut }));
}

function normalizeRecentImages(images: string[] | null | undefined): string[] {
  const seen = new Set<string>();

  return (images ?? [])
    .map((path) => normalizeOptionalText(path))
    .filter((path): path is string => !!path)
    .filter((path) => {
      const key = path.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function normalizeFavoriteImages(images: string[] | null | undefined): string[] {
  const seen = new Set<string>();

  return (images ?? [])
    .map((path) => normalizeOptionalText(path))
    .filter((path): path is string => !!path)
    .filter((path) => {
      const key = path.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 24);
}

function normalizeAppliedSettingsSnapshot(
  browser: BrowserTab,
  snapshot: AppliedSettingsSnapshot | null | undefined
): AppliedSettingsSnapshot | null {
  const appliedAt = normalizeOptionalText(snapshot?.applied_at);
  if (!appliedAt || !snapshot) {
    return null;
  }

  return {
    applied_at: appliedAt,
    settings: projectSettingsForBrowser(browser, normalizeBrowserSettings(snapshot.settings)),
  };
}

export function normalizeBrowserSettings(settings: Partial<BrowserSettings> | null | undefined): BrowserSettings {
  const defaults = createDefaultSettings();
  const input = settings ?? {};

  return {
    ...defaults,
    ...input,
    background_image: normalizeOptionalText(input.background_image) ?? null,
    background_image_mode: normalizeEnum(
      input.background_image_mode,
      ['managed', 'direct'],
      defaults.background_image_mode
    ) as BrowserSettings['background_image_mode'],
    overlay_opacity: clamp(input.overlay_opacity ?? defaults.overlay_opacity, 0, 100),
    clock_color: normalizeColor(input.clock_color, defaults.clock_color),
    clock_size: clamp(input.clock_size ?? defaults.clock_size, 32, 120),
    search_engine: normalizeEnum(
      input.search_engine,
      ['google', 'bing', 'baidu', 'duckduckgo', 'custom'],
      defaults.search_engine
    ),
    search_url_template: input.search_url_template?.trim() ?? defaults.search_url_template,
    shortcuts: normalizeShortcuts(input.shortcuts, defaults.shortcuts),
    clock_position: normalizePosition(input.clock_position, defaults.clock_position),
    search_position: normalizePosition(input.search_position, defaults.search_position),
    shortcuts_position: normalizePosition(input.shortcuts_position, defaults.shortcuts_position),
    background_color: normalizeColor(input.background_color, defaults.background_color),
    background_fit: normalizeEnum(
      input.background_fit,
      ['cover', 'contain', 'center', 'stretch'],
      defaults.background_fit
    ),
    background_blur: clamp(input.background_blur ?? defaults.background_blur, 0, 20),
    background_brightness: clamp(
      input.background_brightness ?? defaults.background_brightness,
      50,
      150
    ),
    clock_font_weight: normalizeEnum(
      input.clock_font_weight,
      ['light', 'normal', 'bold'],
      defaults.clock_font_weight
    ),
    search_bg_color: normalizeColor(input.search_bg_color, defaults.search_bg_color),
    search_bg_opacity: clamp(input.search_bg_opacity ?? defaults.search_bg_opacity, 0, 100),
    search_border_radius: clamp(
      input.search_border_radius ?? defaults.search_border_radius,
      0,
      60
    ),
    search_placeholder: normalizeText(input.search_placeholder, defaults.search_placeholder),
    search_border_width: clamp(input.search_border_width ?? defaults.search_border_width, 0, 5),
    search_border_color: normalizeColor(input.search_border_color, defaults.search_border_color),
    search_border_style: normalizeEnum(
      input.search_border_style,
      ['none', 'solid', 'dashed', 'double'],
      defaults.search_border_style
    ),
    search_shadow_color: normalizeColor(input.search_shadow_color, defaults.search_shadow_color),
    search_shadow_blur: clamp(input.search_shadow_blur ?? defaults.search_shadow_blur, 0, 40),
    search_shadow_opacity: clamp(
      input.search_shadow_opacity ?? defaults.search_shadow_opacity,
      0,
      100
    ),
    search_backdrop_blur: clamp(
      input.search_backdrop_blur ?? defaults.search_backdrop_blur,
      0,
      20
    ),
    search_text_color: normalizeColor(input.search_text_color, defaults.search_text_color),
    search_width: clamp(input.search_width ?? defaults.search_width, 300, 800),
    search_padding: clamp(input.search_padding ?? defaults.search_padding, 0, 20),
    shortcuts_bg_color: normalizeColor(input.shortcuts_bg_color, defaults.shortcuts_bg_color),
    shortcuts_bg_opacity: clamp(
      input.shortcuts_bg_opacity ?? defaults.shortcuts_bg_opacity,
      0,
      100
    ),
    shortcuts_border_radius: clamp(
      input.shortcuts_border_radius ?? defaults.shortcuts_border_radius,
      0,
      50
    ),
    shortcuts_columns: normalizeEnum(
      input.shortcuts_columns,
      ['auto', '2', '3', '4', '5', '6'],
      defaults.shortcuts_columns
    ),
    shortcuts_gap: clamp(input.shortcuts_gap ?? defaults.shortcuts_gap, 4, 32),
    shortcuts_border_width: clamp(
      input.shortcuts_border_width ?? defaults.shortcuts_border_width,
      0,
      5
    ),
    shortcuts_border_color: normalizeColor(
      input.shortcuts_border_color,
      defaults.shortcuts_border_color
    ),
    shortcuts_border_style: normalizeEnum(
      input.shortcuts_border_style,
      ['none', 'solid', 'dashed', 'double'],
      defaults.shortcuts_border_style
    ),
    shortcuts_shadow_color: normalizeColor(
      input.shortcuts_shadow_color,
      defaults.shortcuts_shadow_color
    ),
    shortcuts_shadow_blur: clamp(
      input.shortcuts_shadow_blur ?? defaults.shortcuts_shadow_blur,
      0,
      40
    ),
    shortcuts_shadow_opacity: clamp(
      input.shortcuts_shadow_opacity ?? defaults.shortcuts_shadow_opacity,
      0,
      100
    ),
    shortcuts_backdrop_blur: clamp(
      input.shortcuts_backdrop_blur ?? defaults.shortcuts_backdrop_blur,
      0,
      20
    ),
    shortcuts_title_color: normalizeColor(
      input.shortcuts_title_color,
      defaults.shortcuts_title_color
    ),
    shortcuts_icon_size: clamp(
      input.shortcuts_icon_size ?? defaults.shortcuts_icon_size,
      16,
      64
    ),
    shortcuts_padding_x: clamp(
      input.shortcuts_padding_x ?? defaults.shortcuts_padding_x,
      0,
      30
    ),
    shortcuts_padding_y: clamp(
      input.shortcuts_padding_y ?? defaults.shortcuts_padding_y,
      0,
      30
    ),
    shortcuts_shape: normalizeEnum(
      input.shortcuts_shape,
      ['auto', 'square', 'circle'],
      defaults.shortcuts_shape
    ),
    clock_shadow_color: normalizeColor(input.clock_shadow_color, defaults.clock_shadow_color),
    clock_shadow_blur: clamp(input.clock_shadow_blur ?? defaults.clock_shadow_blur, 0, 30),
    clock_shadow_opacity: clamp(
      input.clock_shadow_opacity ?? defaults.clock_shadow_opacity,
      0,
      100
    ),
    clock_letter_spacing: clamp(
      input.clock_letter_spacing ?? defaults.clock_letter_spacing,
      -10,
      20
    ),
    clock_font_family: normalizeEnum(
      input.clock_font_family,
      ['system', 'serif', 'mono'],
      defaults.clock_font_family
    ),
    overlay_color: normalizeColor(input.overlay_color, defaults.overlay_color),
    custom_css: input.custom_css?.trim() ?? defaults.custom_css,
  };
}

export function projectSettingsForBrowser(browser: BrowserTab, settings: BrowserSettings): BrowserSettings {
  if (browser === 'chrome') {
    return settings;
  }

  const defaults = createDefaultSettings();
  const capabilities = browserCapabilities.firefox;

  return {
    ...settings,
    show_clock: capabilities.supportsClock ? settings.show_clock : defaults.show_clock,
    clock_color: capabilities.supportsClock ? settings.clock_color : defaults.clock_color,
    clock_size: capabilities.supportsClock ? settings.clock_size : defaults.clock_size,
    clock_format_24h: capabilities.supportsClock
      ? settings.clock_format_24h
      : defaults.clock_format_24h,
    clock_show_seconds: capabilities.supportsClock
      ? settings.clock_show_seconds
      : defaults.clock_show_seconds,
    clock_show_date: capabilities.supportsClock ? settings.clock_show_date : defaults.clock_show_date,
    clock_font_weight: capabilities.supportsClock
      ? settings.clock_font_weight
      : defaults.clock_font_weight,
    clock_shadow_color: capabilities.supportsClock
      ? settings.clock_shadow_color
      : defaults.clock_shadow_color,
    clock_shadow_blur: capabilities.supportsClock
      ? settings.clock_shadow_blur
      : defaults.clock_shadow_blur,
    clock_shadow_opacity: capabilities.supportsClock
      ? settings.clock_shadow_opacity
      : defaults.clock_shadow_opacity,
    clock_letter_spacing: capabilities.supportsClock
      ? settings.clock_letter_spacing
      : defaults.clock_letter_spacing,
    clock_font_family: capabilities.supportsClock
      ? settings.clock_font_family
      : defaults.clock_font_family,
    search_engine: capabilities.supportsSearchEngine
      ? settings.search_engine
      : defaults.search_engine,
    search_url_template: capabilities.supportsSearchEngine
      ? settings.search_url_template
      : defaults.search_url_template,
    search_bg_color: capabilities.supportsSearchStyling
      ? settings.search_bg_color
      : defaults.search_bg_color,
    search_bg_opacity: capabilities.supportsSearchStyling
      ? settings.search_bg_opacity
      : defaults.search_bg_opacity,
    search_border_radius: capabilities.supportsSearchStyling
      ? settings.search_border_radius
      : defaults.search_border_radius,
    search_placeholder: capabilities.supportsSearchEngine
      ? settings.search_placeholder
      : defaults.search_placeholder,
    search_border_width: capabilities.supportsSearchStyling
      ? settings.search_border_width
      : defaults.search_border_width,
    search_border_color: capabilities.supportsSearchStyling
      ? settings.search_border_color
      : defaults.search_border_color,
    search_border_style: capabilities.supportsSearchStyling
      ? settings.search_border_style
      : defaults.search_border_style,
    search_shadow_color: capabilities.supportsSearchStyling
      ? settings.search_shadow_color
      : defaults.search_shadow_color,
    search_shadow_blur: capabilities.supportsSearchStyling
      ? settings.search_shadow_blur
      : defaults.search_shadow_blur,
    search_shadow_opacity: capabilities.supportsSearchStyling
      ? settings.search_shadow_opacity
      : defaults.search_shadow_opacity,
    search_backdrop_blur: capabilities.supportsSearchStyling
      ? settings.search_backdrop_blur
      : defaults.search_backdrop_blur,
    search_text_color: capabilities.supportsSearchStyling
      ? settings.search_text_color
      : defaults.search_text_color,
    search_width: capabilities.supportsSearchPositioning
      ? settings.search_width
      : defaults.search_width,
    search_padding: capabilities.supportsSearchPositioning
      ? settings.search_padding
      : defaults.search_padding,
    search_position: capabilities.supportsSearchPositioning
      ? settings.search_position
      : defaults.search_position,
    shortcuts: capabilities.supportsShortcutsEditing ? settings.shortcuts : defaults.shortcuts,
    shortcuts_position: capabilities.supportsShortcutsPositioning
      ? settings.shortcuts_position
      : defaults.shortcuts_position,
    shortcuts_bg_color: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_bg_color
      : defaults.shortcuts_bg_color,
    shortcuts_bg_opacity: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_bg_opacity
      : defaults.shortcuts_bg_opacity,
    shortcuts_border_radius: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_border_radius
      : defaults.shortcuts_border_radius,
    shortcuts_columns: capabilities.supportsShortcutsPositioning
      ? settings.shortcuts_columns
      : defaults.shortcuts_columns,
    shortcuts_gap: capabilities.supportsShortcutsPositioning
      ? settings.shortcuts_gap
      : defaults.shortcuts_gap,
    shortcuts_border_width: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_border_width
      : defaults.shortcuts_border_width,
    shortcuts_border_color: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_border_color
      : defaults.shortcuts_border_color,
    shortcuts_border_style: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_border_style
      : defaults.shortcuts_border_style,
    shortcuts_shadow_color: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_shadow_color
      : defaults.shortcuts_shadow_color,
    shortcuts_shadow_blur: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_shadow_blur
      : defaults.shortcuts_shadow_blur,
    shortcuts_shadow_opacity: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_shadow_opacity
      : defaults.shortcuts_shadow_opacity,
    shortcuts_backdrop_blur: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_backdrop_blur
      : defaults.shortcuts_backdrop_blur,
    shortcuts_title_color: capabilities.supportsShortcutsStyling
      ? settings.shortcuts_title_color
      : defaults.shortcuts_title_color,
    shortcuts_icon_size: capabilities.supportsShortcutsEditing
      ? settings.shortcuts_icon_size
      : defaults.shortcuts_icon_size,
    shortcuts_padding_x: capabilities.supportsShortcutsEditing
      ? settings.shortcuts_padding_x
      : defaults.shortcuts_padding_x,
    shortcuts_padding_y: capabilities.supportsShortcutsEditing
      ? settings.shortcuts_padding_y
      : defaults.shortcuts_padding_y,
    shortcuts_shape: capabilities.supportsShortcutsEditing
      ? settings.shortcuts_shape
      : defaults.shortcuts_shape,
    custom_css: capabilities.supportsCustomCss ? settings.custom_css : defaults.custom_css,
  };
}

export function normalizeAppConfig(config: AppConfig | null | undefined): AppConfig {
  const defaults = createDefaultAppConfig();
  const input = config ?? defaults;
  const selectedProfilePath = normalizeOptionalText(input.firefox?.selected_profile_path) ?? null;
  const profileSettingsByKey = Object.fromEntries(
    Object.entries(input.firefox?.profile_settings_by_key ?? {}).map(([key, settings]) => [
      key.trim(),
      projectSettingsForBrowser('firefox', normalizeBrowserSettings(settings)),
    ]).filter(([key]) => !!key)
  );

  return {
    config_version: CONFIG_VERSION,
    firefox: {
      selected_profile_path: selectedProfilePath,
      profile_settings_by_key: profileSettingsByKey,
      last_applied_by_profile_key: Object.fromEntries(
        Object.entries(input.firefox?.last_applied_by_profile_key ?? {})
          .map(([key, snapshot]) => [
            key.trim(),
            normalizeAppliedSettingsSnapshot('firefox', snapshot),
          ])
          .filter(
            (
              entry
            ): entry is [string, AppliedSettingsSnapshot] => !!entry[0] && !!entry[1]
          )
      ),
    },
    chrome: {
      settings: projectSettingsForBrowser(
        'chrome',
        normalizeBrowserSettings(input.chrome?.settings)
      ),
      last_applied: normalizeAppliedSettingsSnapshot('chrome', input.chrome?.last_applied),
    },
    custom_presets: (input.custom_presets ?? [])
      .map((preset) => {
        const browser = normalizePresetBrowser(preset.browser);
        return {
          name: preset.name?.trim() ?? '',
          browser,
          settings: projectSettingsForBrowser(browser, normalizeBrowserSettings(preset.settings)),
        };
      })
      .filter((preset) => preset.name),
    recent_background_images: normalizeRecentImages(input.recent_background_images),
    favorite_background_images: normalizeFavoriteImages(input.favorite_background_images),
  };
}

export function normalizeImportedSettings(
  targetBrowser: BrowserTab,
  payload: SettingsExchangeFile | null | undefined
): SettingsExchangeFile | null {
  if (!payload) {
    return null;
  }

  const normalizedSettings = projectSettingsForBrowser(
    targetBrowser,
    normalizeBrowserSettings(payload.settings)
  );

  return {
    version: payload.version || CONFIG_VERSION,
    browser: payload.browser ?? null,
    settings: normalizedSettings,
  };
}

const projectionComparableFields = [
  'show_clock',
  'clock_color',
  'clock_size',
  'clock_format_24h',
  'clock_show_seconds',
  'clock_show_date',
  'clock_font_weight',
  'clock_shadow_color',
  'clock_shadow_blur',
  'clock_shadow_opacity',
  'clock_letter_spacing',
  'clock_font_family',
  'search_engine',
  'search_url_template',
  'search_placeholder',
  'search_width',
  'search_padding',
  'search_position',
  'shortcuts',
  'shortcuts_columns',
  'shortcuts_gap',
  'shortcuts_icon_size',
  'shortcuts_padding_x',
  'shortcuts_padding_y',
  'shortcuts_shape',
  'shortcuts_position',
  'custom_css',
] as const satisfies ReadonlyArray<keyof BrowserSettings>;

export function getProjectedSettingKeys(
  targetBrowser: BrowserTab,
  settings: BrowserSettings
): string[] {
  const normalized = normalizeBrowserSettings(settings);
  const projected = projectSettingsForBrowser(targetBrowser, normalized);

  return projectionComparableFields.filter((key) => {
    return JSON.stringify(normalized[key]) !== JSON.stringify(projected[key]);
  });
}

export function createImportProjectionWarning(
  targetBrowser: BrowserTab,
  payload: SettingsExchangeFile | null | undefined
): AppWarning | null {
  if (!payload) {
    return null;
  }

  const details = getProjectedSettingKeys(targetBrowser, payload.settings);
  if (details.length === 0) {
    return null;
  }

  return {
    code: 'import_trimmed_fields',
    message: 'Some imported settings are not supported for this browser and were reset.',
    details,
  };
}
