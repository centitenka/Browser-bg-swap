import type { BrowserSettings } from '../types';

export interface BuiltinPreset {
  name: string;
  description: string;
  settings: Partial<BrowserSettings>;
}

export const builtinPresets: BuiltinPreset[] = [
  {
    name: '极简',
    description: 'Minimal — Only clock, large font, no search, no shortcuts',
    settings: {
      show_clock: true,
      clock_size: 96,
      clock_font_weight: 'light',
      show_search_box: false,
      show_shortcuts: false,
      background_color: '#0a0a0a',
      overlay_opacity: 0,
    },
  },
  {
    name: '仪表盘',
    description: 'Dashboard — Everything visible, moderate sizes',
    settings: {
      show_clock: true,
      clock_size: 64,
      show_search_box: true,
      show_shortcuts: true,
      background_color: '#1a1a2e',
    },
  },
  {
    name: '专注',
    description: 'Focus — Only search box, no clock, no shortcuts',
    settings: {
      show_clock: false,
      show_search_box: true,
      show_shortcuts: false,
      search_border_radius: 12,
      background_color: '#1e1e2e',
      search_position: { x: 50, y: 45 },
    },
  },
  {
    name: '暗夜',
    description: 'Dark Night — Dark background, low contrast cards',
    settings: {
      show_clock: true,
      show_search_box: true,
      show_shortcuts: true,
      background_color: '#0d0d0d',
      overlay_opacity: 50,
      clock_color: '#888888',
      clock_size: 60,
      search_bg_color: '#333333',
      search_bg_opacity: 80,
      shortcuts_bg_color: '#333333',
      shortcuts_bg_opacity: 70,
    },
  },
  {
    name: '毛玻璃',
    description: 'Frosted Glass — High blur with semi-transparent cards',
    settings: {
      show_clock: true,
      show_search_box: true,
      show_shortcuts: true,
      background_blur: 12,
      background_brightness: 80,
      overlay_opacity: 20,
      search_bg_color: '#ffffff',
      search_bg_opacity: 40,
      shortcuts_bg_color: '#ffffff',
      shortcuts_bg_opacity: 30,
    },
  },
];
