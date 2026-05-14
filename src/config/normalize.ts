import { browserCapabilities } from './capabilities';
import { CONFIG_VERSION, createDefaultAppConfig, createDefaultSettings, sharedConfigSchema } from './defaults';
import type {
  AppConfig,
  BrowserSettings,
  BrowserTab,
  ElementPosition,
  LayoutSettings,
  SettingsExchangeFile,
  Shortcut,
  ThemeBackgroundSettings,
  ThemeClockSettings,
  ThemeSearchSettings,
  ThemeSettings,
  ThemeShortcutsSettings,
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

function normalizeShortcutLink(shortcut: Shortcut): Shortcut | null {
  const title = shortcut.title?.trim() ?? '';
  const url = shortcut.url?.trim() ?? '';

  if (!title || !url) {
    return null;
  }

  return {
    kind: 'link',
    title,
    url,
    icon: shortcut.icon?.trim() || '\uD83D\uDD17',
    position: shortcut.position ? normalizePosition(shortcut.position, { x: 50, y: 68 }) : undefined,
  };
}

function normalizeShortcutFolder(shortcut: Shortcut): Shortcut | null {
  const title = shortcut.title?.trim() ?? '';
  if (!title) {
    return null;
  }

  const children = (shortcut.children ?? [])
    .map((child) => normalizeShortcutLink({ ...child, kind: 'link' }))
    .filter((child): child is Shortcut => child !== null)
    .slice(0, 16);

  if (children.length === 0) {
    return null;
  }

  return {
    kind: 'folder',
    title,
    icon: shortcut.icon?.trim() || '\uD83D\uDCC1',
    position: shortcut.position ? normalizePosition(shortcut.position, { x: 50, y: 68 }) : undefined,
    children,
  };
}

function normalizeShortcut(shortcut: Shortcut): Shortcut | null {
  const kind = normalizeEnumSetting(shortcut.kind, 'shortcut_kind', 'link');
  return kind === 'folder' ? normalizeShortcutFolder(shortcut) : normalizeShortcutLink(shortcut);
}

function normalizeShortcuts(shortcuts: Shortcut[] | null | undefined, fallback: Shortcut[]): Shortcut[] {
  const normalized = (shortcuts ?? [])
    .map(normalizeShortcut)
    .filter((shortcut): shortcut is Shortcut => shortcut !== null)
    .slice(0, 16);

  return normalized.length > 0 ? normalized : fallback.map((shortcut) => ({ ...shortcut }));
}

function normalizeBackgroundTheme(
  value: Partial<ThemeBackgroundSettings> | null | undefined,
  input: Partial<BrowserSettings>,
  fallback: ThemeBackgroundSettings
): ThemeBackgroundSettings {
  return {
    color: normalizeColor(value?.color ?? input.background_color, fallback.color),
    fit: normalizeEnumSetting(value?.fit ?? input.background_fit, 'background_fit', fallback.fit),
    blur: clampSetting(value?.blur ?? input.background_blur, 'background_blur', fallback.blur),
    brightness: clampSetting(
      value?.brightness ?? input.background_brightness,
      'background_brightness',
      fallback.brightness
    ),
    overlay_color: normalizeColor(value?.overlay_color ?? input.overlay_color, fallback.overlay_color),
    overlay_opacity: clampSetting(
      value?.overlay_opacity ?? input.overlay_opacity,
      'overlay_opacity',
      fallback.overlay_opacity
    ),
    gradient_enabled: value?.gradient_enabled ?? fallback.gradient_enabled,
    gradient_from: normalizeColor(value?.gradient_from, fallback.gradient_from),
    gradient_to: normalizeColor(value?.gradient_to, fallback.gradient_to),
    gradient_direction: normalizeEnumSetting(
      value?.gradient_direction,
      'gradient_direction',
      fallback.gradient_direction
    ),
  };
}

function normalizeClockTheme(
  value: Partial<ThemeClockSettings> | null | undefined,
  input: Partial<BrowserSettings>,
  fallback: ThemeClockSettings
): ThemeClockSettings {
  return {
    color: normalizeColor(value?.color ?? input.clock_color, fallback.color),
    size: clampSetting(value?.size ?? input.clock_size, 'clock_size', fallback.size),
    format_24h: value?.format_24h ?? input.clock_format_24h ?? fallback.format_24h,
    show_seconds: value?.show_seconds ?? input.clock_show_seconds ?? fallback.show_seconds,
    show_date: value?.show_date ?? input.clock_show_date ?? fallback.show_date,
    font_weight: normalizeEnumSetting(
      value?.font_weight ?? input.clock_font_weight,
      'clock_font_weight',
      fallback.font_weight
    ),
    font_family: normalizeEnumSetting(
      value?.font_family ?? input.clock_font_family,
      'clock_font_family',
      fallback.font_family
    ),
    shadow_color: normalizeColor(value?.shadow_color ?? input.clock_shadow_color, fallback.shadow_color),
    shadow_blur: clampSetting(
      value?.shadow_blur ?? input.clock_shadow_blur,
      'clock_shadow_blur',
      fallback.shadow_blur
    ),
    shadow_opacity: clampSetting(
      value?.shadow_opacity ?? input.clock_shadow_opacity,
      'clock_shadow_opacity',
      fallback.shadow_opacity
    ),
    letter_spacing: clampSetting(
      value?.letter_spacing ?? input.clock_letter_spacing,
      'clock_letter_spacing',
      fallback.letter_spacing
    ),
  };
}

function normalizeSearchTheme(
  value: Partial<ThemeSearchSettings> | null | undefined,
  input: Partial<BrowserSettings>,
  fallback: ThemeSearchSettings
): ThemeSearchSettings {
  return {
    engine: normalizeEnumSetting(value?.engine ?? input.search_engine, 'search_engine', fallback.engine),
    bg_color: normalizeColor(value?.bg_color ?? input.search_bg_color, fallback.bg_color),
    bg_opacity: clampSetting(value?.bg_opacity ?? input.search_bg_opacity, 'search_bg_opacity', fallback.bg_opacity),
    border_radius: clampSetting(
      value?.border_radius ?? input.search_border_radius,
      'search_border_radius',
      fallback.border_radius
    ),
    placeholder: normalizeText(value?.placeholder ?? input.search_placeholder, fallback.placeholder),
    border_width: clampSetting(
      value?.border_width ?? input.search_border_width,
      'search_border_width',
      fallback.border_width
    ),
    border_color: normalizeColor(value?.border_color ?? input.search_border_color, fallback.border_color),
    border_style: normalizeEnumSetting(
      value?.border_style ?? input.search_border_style,
      'search_border_style',
      fallback.border_style
    ),
    shadow_color: normalizeColor(value?.shadow_color ?? input.search_shadow_color, fallback.shadow_color),
    shadow_blur: clampSetting(
      value?.shadow_blur ?? input.search_shadow_blur,
      'search_shadow_blur',
      fallback.shadow_blur
    ),
    shadow_opacity: clampSetting(
      value?.shadow_opacity ?? input.search_shadow_opacity,
      'search_shadow_opacity',
      fallback.shadow_opacity
    ),
    backdrop_blur: clampSetting(
      value?.backdrop_blur ?? input.search_backdrop_blur,
      'search_backdrop_blur',
      fallback.backdrop_blur
    ),
    text_color: normalizeColor(value?.text_color ?? input.search_text_color, fallback.text_color),
    width: clampSetting(value?.width ?? input.search_width, 'search_width', fallback.width),
    padding: clampSetting(value?.padding ?? input.search_padding, 'search_padding', fallback.padding),
  };
}

function normalizeShortcutsTheme(
  value: Partial<ThemeShortcutsSettings> | null | undefined,
  input: Partial<BrowserSettings>,
  fallback: ThemeShortcutsSettings
): ThemeShortcutsSettings {
  return {
    bg_color: normalizeColor(value?.bg_color ?? input.shortcuts_bg_color, fallback.bg_color),
    bg_opacity: clampSetting(
      value?.bg_opacity ?? input.shortcuts_bg_opacity,
      'shortcuts_bg_opacity',
      fallback.bg_opacity
    ),
    border_radius: clampSetting(
      value?.border_radius ?? input.shortcuts_border_radius,
      'shortcuts_border_radius',
      fallback.border_radius
    ),
    columns: normalizeEnumSetting(value?.columns ?? input.shortcuts_columns, 'shortcuts_columns', fallback.columns),
    gap: clampSetting(value?.gap ?? input.shortcuts_gap, 'shortcuts_gap', fallback.gap),
    border_width: clampSetting(
      value?.border_width ?? input.shortcuts_border_width,
      'shortcuts_border_width',
      fallback.border_width
    ),
    border_color: normalizeColor(value?.border_color ?? input.shortcuts_border_color, fallback.border_color),
    border_style: normalizeEnumSetting(
      value?.border_style ?? input.shortcuts_border_style,
      'shortcuts_border_style',
      fallback.border_style
    ),
    shadow_color: normalizeColor(value?.shadow_color ?? input.shortcuts_shadow_color, fallback.shadow_color),
    shadow_blur: clampSetting(
      value?.shadow_blur ?? input.shortcuts_shadow_blur,
      'shortcuts_shadow_blur',
      fallback.shadow_blur
    ),
    shadow_opacity: clampSetting(
      value?.shadow_opacity ?? input.shortcuts_shadow_opacity,
      'shortcuts_shadow_opacity',
      fallback.shadow_opacity
    ),
    backdrop_blur: clampSetting(
      value?.backdrop_blur ?? input.shortcuts_backdrop_blur,
      'shortcuts_backdrop_blur',
      fallback.backdrop_blur
    ),
    title_color: normalizeColor(value?.title_color ?? input.shortcuts_title_color, fallback.title_color),
    icon_size: clampSetting(value?.icon_size ?? input.shortcuts_icon_size, 'shortcuts_icon_size', fallback.icon_size),
    padding_x: clampSetting(
      value?.padding_x ?? input.shortcuts_padding_x,
      'shortcuts_padding_x',
      fallback.padding_x
    ),
    padding_y: clampSetting(
      value?.padding_y ?? input.shortcuts_padding_y,
      'shortcuts_padding_y',
      fallback.padding_y
    ),
    shape: normalizeEnumSetting(value?.shape ?? input.shortcuts_shape, 'shortcuts_shape', fallback.shape),
  };
}

function normalizeTheme(input: Partial<BrowserSettings>, defaults: BrowserSettings): ThemeSettings {
  const theme: Partial<ThemeSettings> = input.theme ?? {};
  return {
    background: normalizeBackgroundTheme(theme.background, input, defaults.theme.background),
    clock: normalizeClockTheme(theme.clock, input, defaults.theme.clock),
    search: normalizeSearchTheme(theme.search, input, defaults.theme.search),
    shortcuts: normalizeShortcutsTheme(theme.shortcuts, input, defaults.theme.shortcuts),
  };
}

function normalizeLayout(input: Partial<BrowserSettings>, defaults: BrowserSettings): LayoutSettings {
  const layout: Partial<LayoutSettings> = input.layout ?? {};
  return {
    clock_position: normalizePosition(
      layout.clock_position ?? input.clock_position,
      defaults.layout.clock_position
    ),
    search_position: normalizePosition(
      layout.search_position ?? input.search_position,
      defaults.layout.search_position
    ),
    shortcuts_position: normalizePosition(
      layout.shortcuts_position ?? input.shortcuts_position,
      defaults.layout.shortcuts_position
    ),
  };
}

export function normalizeBrowserSettings(settings: Partial<BrowserSettings> | null | undefined): BrowserSettings {
  const defaults = createDefaultSettings();
  const input = settings ?? {};
  const theme = normalizeTheme(input, defaults);
  const layout = normalizeLayout(input, defaults);

  return {
    ...defaults,
    ...input,
    theme,
    layout,
    background_image: input.background_image?.trim() || null,
    overlay_opacity: theme.background.overlay_opacity,
    clock_color: theme.clock.color,
    clock_size: theme.clock.size,
    search_engine: theme.search.engine,
    shortcuts: normalizeShortcuts(input.shortcuts, defaults.shortcuts),
    clock_position: layout.clock_position,
    search_position: layout.search_position,
    shortcuts_position: layout.shortcuts_position,
    background_color: theme.background.color,
    background_fit: theme.background.fit,
    background_blur: theme.background.blur,
    background_brightness: theme.background.brightness,
    clock_format_24h: theme.clock.format_24h,
    clock_show_seconds: theme.clock.show_seconds,
    clock_show_date: theme.clock.show_date,
    clock_font_weight: theme.clock.font_weight,
    search_bg_color: theme.search.bg_color,
    search_bg_opacity: theme.search.bg_opacity,
    search_border_radius: theme.search.border_radius,
    search_placeholder: theme.search.placeholder,
    search_border_width: theme.search.border_width,
    search_border_color: theme.search.border_color,
    search_border_style: theme.search.border_style,
    search_shadow_color: theme.search.shadow_color,
    search_shadow_blur: theme.search.shadow_blur,
    search_shadow_opacity: theme.search.shadow_opacity,
    search_backdrop_blur: theme.search.backdrop_blur,
    search_text_color: theme.search.text_color,
    search_width: theme.search.width,
    search_padding: theme.search.padding,
    shortcuts_bg_color: theme.shortcuts.bg_color,
    shortcuts_bg_opacity: theme.shortcuts.bg_opacity,
    shortcuts_border_radius: theme.shortcuts.border_radius,
    shortcuts_columns: theme.shortcuts.columns,
    shortcuts_gap: theme.shortcuts.gap,
    shortcuts_border_width: theme.shortcuts.border_width,
    shortcuts_border_color: theme.shortcuts.border_color,
    shortcuts_border_style: theme.shortcuts.border_style,
    shortcuts_shadow_color: theme.shortcuts.shadow_color,
    shortcuts_shadow_blur: theme.shortcuts.shadow_blur,
    shortcuts_shadow_opacity: theme.shortcuts.shadow_opacity,
    shortcuts_backdrop_blur: theme.shortcuts.backdrop_blur,
    shortcuts_title_color: theme.shortcuts.title_color,
    shortcuts_icon_size: theme.shortcuts.icon_size,
    shortcuts_padding_x: theme.shortcuts.padding_x,
    shortcuts_padding_y: theme.shortcuts.padding_y,
    shortcuts_shape: theme.shortcuts.shape,
    clock_shadow_color: theme.clock.shadow_color,
    clock_shadow_blur: theme.clock.shadow_blur,
    clock_shadow_opacity: theme.clock.shadow_opacity,
    clock_letter_spacing: theme.clock.letter_spacing,
    clock_font_family: theme.clock.font_family,
    overlay_color: theme.background.overlay_color,
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
    theme: {
      ...settings.theme,
      clock: capabilities.supportsClock ? settings.theme.clock : defaults.theme.clock,
      search: capabilities.supportsSearchCustomization ? settings.theme.search : defaults.theme.search,
      shortcuts: capabilities.supportsShortcutsCustomization
        ? settings.theme.shortcuts
        : defaults.theme.shortcuts,
    },
    layout: {
      ...settings.layout,
      clock_position: capabilities.supportsClock
        ? settings.layout.clock_position
        : defaults.layout.clock_position,
      search_position: capabilities.supportsSearchCustomization
        ? settings.layout.search_position
        : defaults.layout.search_position,
      shortcuts_position: capabilities.supportsShortcutsCustomization
        ? settings.layout.shortcuts_position
        : defaults.layout.shortcuts_position,
    },
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
