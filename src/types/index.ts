export interface ElementPosition {
  x: number;
  y: number;
}

export interface Shortcut {
  title: string;
  url: string;
  icon: string;
  position?: ElementPosition;
}

export interface BrowserSettings {
  background_image: string | null;
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
  firefox: FirefoxConfig;
  chrome: ChromeConfig;
  custom_presets: NamedPreset[];
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
