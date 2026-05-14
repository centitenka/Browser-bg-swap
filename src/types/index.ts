export type BrowserTab = 'firefox' | 'chrome';

export interface ElementPosition {
  x: number;
  y: number;
}

export type ShortcutKind = 'link' | 'folder';

export interface Shortcut {
  kind?: ShortcutKind;
  title: string;
  url?: string;
  icon: string;
  position?: ElementPosition;
  children?: Shortcut[];
}

export interface ThemeBackgroundSettings {
  color: string;
  fit: string;
  blur: number;
  brightness: number;
  overlay_color: string;
  overlay_opacity: number;
  gradient_enabled: boolean;
  gradient_from: string;
  gradient_to: string;
  gradient_direction: string;
}

export interface ThemeClockSettings {
  color: string;
  size: number;
  format_24h: boolean;
  show_seconds: boolean;
  show_date: boolean;
  font_weight: string;
  font_family: string;
  shadow_color: string;
  shadow_blur: number;
  shadow_opacity: number;
  letter_spacing: number;
}

export interface ThemeSearchSettings {
  engine: string;
  bg_color: string;
  bg_opacity: number;
  border_radius: number;
  placeholder: string;
  border_width: number;
  border_color: string;
  border_style: string;
  shadow_color: string;
  shadow_blur: number;
  shadow_opacity: number;
  backdrop_blur: number;
  text_color: string;
  width: number;
  padding: number;
}

export interface ThemeShortcutsSettings {
  bg_color: string;
  bg_opacity: number;
  border_radius: number;
  columns: string;
  gap: number;
  border_width: number;
  border_color: string;
  border_style: string;
  shadow_color: string;
  shadow_blur: number;
  shadow_opacity: number;
  backdrop_blur: number;
  title_color: string;
  icon_size: number;
  padding_x: number;
  padding_y: number;
  shape: string;
}

export interface ThemeSettings {
  background: ThemeBackgroundSettings;
  clock: ThemeClockSettings;
  search: ThemeSearchSettings;
  shortcuts: ThemeShortcutsSettings;
}

export interface LayoutSettings {
  clock_position: ElementPosition;
  search_position: ElementPosition;
  shortcuts_position: ElementPosition;
}

export interface BrowserSettings {
  background_image: string | null;
  theme: ThemeSettings;
  layout: LayoutSettings;
  overlay_opacity: number;
  show_clock: boolean;
  clock_color: string;
  clock_size: number;
  show_search_box: boolean;
  search_engine: string;
  show_shortcuts: boolean;
  shortcuts: Shortcut[];
  clock_position: ElementPosition;
  search_position: ElementPosition;
  shortcuts_position: ElementPosition;

  // Background enhancements
  background_color: string;
  background_fit: string;
  background_blur: number;
  background_brightness: number;

  // Clock enhancements
  clock_format_24h: boolean;
  clock_show_seconds: boolean;
  clock_show_date: boolean;
  clock_font_weight: string;

  // Search box enhancements
  search_bg_color: string;
  search_bg_opacity: number;
  search_border_radius: number;
  search_placeholder: string;
  search_border_width: number;
  search_border_color: string;
  search_border_style: string;
  search_shadow_color: string;
  search_shadow_blur: number;
  search_shadow_opacity: number;
  search_backdrop_blur: number;
  search_text_color: string;
  search_width: number;
  search_padding: number;

  // Shortcuts enhancements
  shortcuts_bg_color: string;
  shortcuts_bg_opacity: number;
  shortcuts_border_radius: number;
  shortcuts_columns: string;
  shortcuts_gap: number;
  shortcuts_border_width: number;
  shortcuts_border_color: string;
  shortcuts_border_style: string;
  shortcuts_shadow_color: string;
  shortcuts_shadow_blur: number;
  shortcuts_shadow_opacity: number;
  shortcuts_backdrop_blur: number;
  shortcuts_title_color: string;
  shortcuts_icon_size: number;
  shortcuts_padding_x: number;
  shortcuts_padding_y: number;
  shortcuts_shape: string;

  // Clock fine-grained
  clock_shadow_color: string;
  clock_shadow_blur: number;
  clock_shadow_opacity: number;
  clock_letter_spacing: number;
  clock_font_family: string;

  // Overlay
  overlay_color: string;

  // Advanced
  custom_css: string;
}

export interface NamedPreset {
  name: string;
  settings: BrowserSettings;
}

export interface FirefoxConfig {
  profile_path: string | null;
  enabled: boolean;
  settings: BrowserSettings;
}

export interface ChromeConfig {
  extension_output_path: string | null;
  enabled: boolean;
  settings: BrowserSettings;
}

export interface AppConfig {
  config_version: number;
  firefox: FirefoxConfig;
  chrome: ChromeConfig;
  custom_presets: NamedPreset[];
}

export interface SettingsExchangeFile {
  version: number;
  browser?: BrowserTab | null;
  settings: BrowserSettings;
}

export type BrowserType = 'Firefox' | 'Chrome' | 'Edge';

export interface ProfileInfo {
  name: string;
  path: string;
  is_default: boolean;
}

export interface BrowserInfo {
  browser_type: BrowserType;
  installed: boolean;
  profile_paths: ProfileInfo[];
}

export interface PrereqCheck {
  toolkit_legacy_enabled: boolean;
  all_ok: boolean;
  instructions: string[];
}

export interface ChromeDetectResult {
  chrome_installed: boolean;
  edge_installed: boolean;
  extension_exists: boolean;
  extension_path: string;
}
