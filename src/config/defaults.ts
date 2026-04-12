import type { AppConfig, BrowserSettings, Shortcut } from '../types';

export const CONFIG_VERSION = 2;

export function createDefaultShortcuts(): Shortcut[] {
  return [
    { title: 'GitHub', url: 'https://github.com', icon: '\uD83D\uDCBB', position: undefined },
    { title: 'YouTube', url: 'https://youtube.com', icon: '\u25B6\uFE0F', position: undefined },
    { title: 'Bilibili', url: 'https://bilibili.com', icon: '\uD83D\uDCFA', position: undefined },
    { title: '\u77E5\u4E4E', url: 'https://zhihu.com', icon: '\u2753', position: undefined },
  ];
}

export function createDefaultSettings(): BrowserSettings {
  return {
    background_image: null,
    overlay_opacity: 30,
    show_clock: true,
    clock_color: '#ffffff',
    clock_size: 72,
    show_search_box: true,
    search_engine: 'google',
    show_shortcuts: true,
    shortcuts: createDefaultShortcuts(),
    clock_position: { x: 50, y: 30 },
    search_position: { x: 50, y: 48 },
    shortcuts_position: { x: 50, y: 68 },
    background_color: '#1a1a2e',
    background_fit: 'cover',
    background_blur: 0,
    background_brightness: 100,
    clock_format_24h: true,
    clock_show_seconds: false,
    clock_show_date: false,
    clock_font_weight: 'light',
    search_bg_color: '#ffffff',
    search_bg_opacity: 95,
    search_border_radius: 28,
    search_placeholder: '\u641C\u7D22...',
    search_border_width: 0,
    search_border_color: '#d4af37',
    search_border_style: 'none',
    search_shadow_color: '#000000',
    search_shadow_blur: 20,
    search_shadow_opacity: 15,
    search_backdrop_blur: 0,
    search_text_color: '#333333',
    search_width: 560,
    search_padding: 4,
    shortcuts_bg_color: '#ffffff',
    shortcuts_bg_opacity: 90,
    shortcuts_border_radius: 12,
    shortcuts_columns: 'auto',
    shortcuts_gap: 12,
    shortcuts_border_width: 0,
    shortcuts_border_color: '#ffffff',
    shortcuts_border_style: 'none',
    shortcuts_shadow_color: '#000000',
    shortcuts_shadow_blur: 0,
    shortcuts_shadow_opacity: 0,
    shortcuts_backdrop_blur: 0,
    shortcuts_title_color: '#333333',
    shortcuts_icon_size: 36,
    shortcuts_padding_x: 8,
    shortcuts_padding_y: 14,
    shortcuts_shape: 'auto',
    clock_shadow_color: '#000000',
    clock_shadow_blur: 10,
    clock_shadow_opacity: 30,
    clock_letter_spacing: 0,
    clock_font_family: 'system',
    overlay_color: '#000000',
    custom_css: '',
  };
}

export function createDefaultAppConfig(): AppConfig {
  return {
    config_version: CONFIG_VERSION,
    firefox: {
      profile_path: null,
      enabled: true,
      settings: createDefaultSettings(),
    },
    chrome: {
      extension_output_path: null,
      enabled: true,
      settings: createDefaultSettings(),
    },
    custom_presets: [],
  };
}
