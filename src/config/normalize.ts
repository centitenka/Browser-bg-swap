import { browserCapabilities } from './capabilities';
import { CONFIG_VERSION, createDefaultAppConfig, createDefaultSettings, sharedConfigSchema } from './defaults';
import type {
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

function clampSetting(value: number | null | undefined, key: string, fallback: number): number {
  const range = sharedConfigSchema.numbers[key];
  if (!range) {
    throw new Error(`Missing numeric config schema for ${key}`);
  }

  return clamp(value ?? fallback, range.min, range.max);
}

function normalizeColor(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized && colorPattern.test(normalized) ? normalized.toLowerCase() : fallback;
}

function normalizeEnum(value: string | null | undefined, allowed: string[], fallback: string): string {
  const normalized = value?.trim().toLowerCase();
  return normalized && allowed.includes(normalized) ? normalized : fallback;
}

function normalizeEnumSetting(value: string | null | undefined, key: string, fallback: string): string {
  const allowed = sharedConfigSchema.enums[key];
  if (!allowed) {
    throw new Error(`Missing enum config schema for ${key}`);
  }

  return normalizeEnum(value, allowed, fallback);
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
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

export function normalizeBrowserSettings(settings: Partial<BrowserSettings> | null | undefined): BrowserSettings {
  const defaults = createDefaultSettings();
  const input = settings ?? {};

  return {
    ...defaults,
    ...input,
    background_image: input.background_image?.trim() || null,
    overlay_opacity: clampSetting(input.overlay_opacity, 'overlay_opacity', defaults.overlay_opacity),
    clock_color: normalizeColor(input.clock_color, defaults.clock_color),
    clock_size: clampSetting(input.clock_size, 'clock_size', defaults.clock_size),
    search_engine: normalizeEnumSetting(input.search_engine, 'search_engine', defaults.search_engine),
    shortcuts: normalizeShortcuts(input.shortcuts, defaults.shortcuts),
    clock_position: normalizePosition(input.clock_position, defaults.clock_position),
    search_position: normalizePosition(input.search_position, defaults.search_position),
    shortcuts_position: normalizePosition(input.shortcuts_position, defaults.shortcuts_position),
    background_color: normalizeColor(input.background_color, defaults.background_color),
    background_fit: normalizeEnumSetting(input.background_fit, 'background_fit', defaults.background_fit),
    background_blur: clampSetting(input.background_blur, 'background_blur', defaults.background_blur),
    background_brightness: clampSetting(
      input.background_brightness,
      'background_brightness',
      defaults.background_brightness
    ),
    clock_font_weight: normalizeEnumSetting(
      input.clock_font_weight,
      'clock_font_weight',
      defaults.clock_font_weight
    ),
    search_bg_color: normalizeColor(input.search_bg_color, defaults.search_bg_color),
    search_bg_opacity: clampSetting(input.search_bg_opacity, 'search_bg_opacity', defaults.search_bg_opacity),
    search_border_radius: clampSetting(
      input.search_border_radius,
      'search_border_radius',
      defaults.search_border_radius
    ),
    search_placeholder: normalizeText(input.search_placeholder, defaults.search_placeholder),
    search_border_width: clampSetting(
      input.search_border_width,
      'search_border_width',
      defaults.search_border_width
    ),
    search_border_color: normalizeColor(input.search_border_color, defaults.search_border_color),
    search_border_style: normalizeEnumSetting(
      input.search_border_style,
      'search_border_style',
      defaults.search_border_style
    ),
    search_shadow_color: normalizeColor(input.search_shadow_color, defaults.search_shadow_color),
    search_shadow_blur: clampSetting(input.search_shadow_blur, 'search_shadow_blur', defaults.search_shadow_blur),
    search_shadow_opacity: clampSetting(
      input.search_shadow_opacity,
      'search_shadow_opacity',
      defaults.search_shadow_opacity
    ),
    search_backdrop_blur: clampSetting(
      input.search_backdrop_blur,
      'search_backdrop_blur',
      defaults.search_backdrop_blur
    ),
    search_text_color: normalizeColor(input.search_text_color, defaults.search_text_color),
    search_width: clampSetting(input.search_width, 'search_width', defaults.search_width),
    search_padding: clampSetting(input.search_padding, 'search_padding', defaults.search_padding),
    shortcuts_bg_color: normalizeColor(input.shortcuts_bg_color, defaults.shortcuts_bg_color),
    shortcuts_bg_opacity: clampSetting(
      input.shortcuts_bg_opacity,
      'shortcuts_bg_opacity',
      defaults.shortcuts_bg_opacity
    ),
    shortcuts_border_radius: clampSetting(
      input.shortcuts_border_radius,
      'shortcuts_border_radius',
      defaults.shortcuts_border_radius
    ),
    shortcuts_columns: normalizeEnumSetting(
      input.shortcuts_columns,
      'shortcuts_columns',
      defaults.shortcuts_columns
    ),
    shortcuts_gap: clampSetting(input.shortcuts_gap, 'shortcuts_gap', defaults.shortcuts_gap),
    shortcuts_border_width: clampSetting(
      input.shortcuts_border_width,
      'shortcuts_border_width',
      defaults.shortcuts_border_width
    ),
    shortcuts_border_color: normalizeColor(
      input.shortcuts_border_color,
      defaults.shortcuts_border_color
    ),
    shortcuts_border_style: normalizeEnumSetting(
      input.shortcuts_border_style,
      'shortcuts_border_style',
      defaults.shortcuts_border_style
    ),
    shortcuts_shadow_color: normalizeColor(
      input.shortcuts_shadow_color,
      defaults.shortcuts_shadow_color
    ),
    shortcuts_shadow_blur: clampSetting(
      input.shortcuts_shadow_blur,
      'shortcuts_shadow_blur',
      defaults.shortcuts_shadow_blur
    ),
    shortcuts_shadow_opacity: clampSetting(
      input.shortcuts_shadow_opacity,
      'shortcuts_shadow_opacity',
      defaults.shortcuts_shadow_opacity
    ),
    shortcuts_backdrop_blur: clampSetting(
      input.shortcuts_backdrop_blur,
      'shortcuts_backdrop_blur',
      defaults.shortcuts_backdrop_blur
    ),
    shortcuts_title_color: normalizeColor(
      input.shortcuts_title_color,
      defaults.shortcuts_title_color
    ),
    shortcuts_icon_size: clampSetting(
      input.shortcuts_icon_size,
      'shortcuts_icon_size',
      defaults.shortcuts_icon_size
    ),
    shortcuts_padding_x: clampSetting(
      input.shortcuts_padding_x,
      'shortcuts_padding_x',
      defaults.shortcuts_padding_x
    ),
    shortcuts_padding_y: clampSetting(
      input.shortcuts_padding_y,
      'shortcuts_padding_y',
      defaults.shortcuts_padding_y
    ),
    shortcuts_shape: normalizeEnumSetting(
      input.shortcuts_shape,
      'shortcuts_shape',
      defaults.shortcuts_shape
    ),
    clock_shadow_color: normalizeColor(input.clock_shadow_color, defaults.clock_shadow_color),
    clock_shadow_blur: clampSetting(
      input.clock_shadow_blur,
      'clock_shadow_blur',
      defaults.clock_shadow_blur
    ),
    clock_shadow_opacity: clampSetting(
      input.clock_shadow_opacity,
      'clock_shadow_opacity',
      defaults.clock_shadow_opacity
    ),
    clock_letter_spacing: clampSetting(
      input.clock_letter_spacing,
      'clock_letter_spacing',
      defaults.clock_letter_spacing
    ),
    clock_font_family: normalizeEnumSetting(
      input.clock_font_family,
      'clock_font_family',
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
    search_engine: capabilities.supportsSearchCustomization
      ? settings.search_engine
      : defaults.search_engine,
    search_bg_color: capabilities.supportsSearchCustomization
      ? settings.search_bg_color
      : defaults.search_bg_color,
    search_bg_opacity: capabilities.supportsSearchCustomization
      ? settings.search_bg_opacity
      : defaults.search_bg_opacity,
    search_border_radius: capabilities.supportsSearchCustomization
      ? settings.search_border_radius
      : defaults.search_border_radius,
    search_placeholder: capabilities.supportsSearchCustomization
      ? settings.search_placeholder
      : defaults.search_placeholder,
    search_border_width: capabilities.supportsSearchCustomization
      ? settings.search_border_width
      : defaults.search_border_width,
    search_border_color: capabilities.supportsSearchCustomization
      ? settings.search_border_color
      : defaults.search_border_color,
    search_border_style: capabilities.supportsSearchCustomization
      ? settings.search_border_style
      : defaults.search_border_style,
    search_shadow_color: capabilities.supportsSearchCustomization
      ? settings.search_shadow_color
      : defaults.search_shadow_color,
    search_shadow_blur: capabilities.supportsSearchCustomization
      ? settings.search_shadow_blur
      : defaults.search_shadow_blur,
    search_shadow_opacity: capabilities.supportsSearchCustomization
      ? settings.search_shadow_opacity
      : defaults.search_shadow_opacity,
    search_backdrop_blur: capabilities.supportsSearchCustomization
      ? settings.search_backdrop_blur
      : defaults.search_backdrop_blur,
    search_text_color: capabilities.supportsSearchCustomization
      ? settings.search_text_color
      : defaults.search_text_color,
    search_width: capabilities.supportsSearchCustomization
      ? settings.search_width
      : defaults.search_width,
    search_padding: capabilities.supportsSearchCustomization
      ? settings.search_padding
      : defaults.search_padding,
    search_position: capabilities.supportsSearchCustomization
      ? settings.search_position
      : defaults.search_position,
    shortcuts: capabilities.supportsShortcutsCustomization ? settings.shortcuts : defaults.shortcuts,
    shortcuts_position: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_position
      : defaults.shortcuts_position,
    shortcuts_bg_color: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_bg_color
      : defaults.shortcuts_bg_color,
    shortcuts_bg_opacity: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_bg_opacity
      : defaults.shortcuts_bg_opacity,
    shortcuts_border_radius: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_border_radius
      : defaults.shortcuts_border_radius,
    shortcuts_columns: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_columns
      : defaults.shortcuts_columns,
    shortcuts_gap: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_gap
      : defaults.shortcuts_gap,
    shortcuts_border_width: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_border_width
      : defaults.shortcuts_border_width,
    shortcuts_border_color: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_border_color
      : defaults.shortcuts_border_color,
    shortcuts_border_style: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_border_style
      : defaults.shortcuts_border_style,
    shortcuts_shadow_color: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_shadow_color
      : defaults.shortcuts_shadow_color,
    shortcuts_shadow_blur: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_shadow_blur
      : defaults.shortcuts_shadow_blur,
    shortcuts_shadow_opacity: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_shadow_opacity
      : defaults.shortcuts_shadow_opacity,
    shortcuts_backdrop_blur: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_backdrop_blur
      : defaults.shortcuts_backdrop_blur,
    shortcuts_title_color: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_title_color
      : defaults.shortcuts_title_color,
    shortcuts_icon_size: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_icon_size
      : defaults.shortcuts_icon_size,
    shortcuts_padding_x: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_padding_x
      : defaults.shortcuts_padding_x,
    shortcuts_padding_y: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_padding_y
      : defaults.shortcuts_padding_y,
    shortcuts_shape: capabilities.supportsShortcutsCustomization
      ? settings.shortcuts_shape
      : defaults.shortcuts_shape,
    custom_css: capabilities.supportsCustomCss ? settings.custom_css : defaults.custom_css,
  };
}

export function normalizeAppConfig(config: AppConfig | null | undefined): AppConfig {
  const defaults = createDefaultAppConfig();
  const input = config ?? defaults;

  return {
    config_version: CONFIG_VERSION,
    firefox: {
      profile_path: input.firefox?.profile_path?.trim() || null,
      enabled: input.firefox?.enabled ?? defaults.firefox.enabled,
      settings: projectSettingsForBrowser(
        'firefox',
        normalizeBrowserSettings(input.firefox?.settings)
      ),
    },
    chrome: {
      extension_output_path: input.chrome?.extension_output_path?.trim() || null,
      enabled: input.chrome?.enabled ?? defaults.chrome.enabled,
      settings: projectSettingsForBrowser(
        'chrome',
        normalizeBrowserSettings(input.chrome?.settings)
      ),
    },
    custom_presets: (input.custom_presets ?? [])
      .map((preset) => ({
        name: preset.name?.trim() ?? '',
        settings: projectSettingsForBrowser('chrome', normalizeBrowserSettings(preset.settings)),
      }))
      .filter((preset) => preset.name),
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
