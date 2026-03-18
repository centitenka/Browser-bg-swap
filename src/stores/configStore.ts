import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { AppConfig, BrowserSettings, BrowserInfo, PrereqCheck, ChromeDetectResult, NamedPreset } from '../types';

type BrowserTab = 'firefox' | 'chrome';

interface ConfigState {
  config: AppConfig;
  firefoxSettings: BrowserSettings;
  chromeSettings: BrowserSettings;
  activeTab: BrowserTab;
  firefoxInfo: BrowserInfo | null;
  chromeInfo: ChromeDetectResult | null;
  selectedProfile: string;
  prereqCheck: PrereqCheck | null;
  backups: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
  setActiveTab: (tab: BrowserTab) => void;
  updateSettings: (settings: Partial<BrowserSettings>) => void;
  detectFirefox: () => Promise<void>;
  selectProfile: (path: string) => void;
  checkPrerequisites: () => Promise<void>;
  applyFirefox: () => Promise<void>;
  autoFixPrerequisites: () => Promise<void>;
  createBackup: () => Promise<void>;
  restoreBackup: (name: string) => Promise<void>;
  loadBackups: () => Promise<void>;
  deleteBackup: (name: string) => Promise<void>;
  detectChrome: () => Promise<void>;
  applyChrome: () => Promise<string>;
  removeChrome: () => Promise<void>;
  selectImage: () => Promise<string | null>;
  exportSettings: () => Promise<void>;
  importSettings: () => Promise<void>;
  resetSettings: () => void;
  savePreset: (name: string) => Promise<void>;
  deletePreset: (index: number) => Promise<void>;
}

const defaultShortcuts = [
  { title: 'GitHub', url: 'https://github.com', icon: '\uD83D\uDCBB', position: undefined },
  { title: 'YouTube', url: 'https://youtube.com', icon: '\u25B6\uFE0F', position: undefined },
  { title: 'Bilibili', url: 'https://bilibili.com', icon: '\uD83D\uDCFA', position: undefined },
  { title: '\u77E5\u4E4E', url: 'https://zhihu.com', icon: '\u2753', position: undefined },
];

export const defaultSettings: BrowserSettings = {
  background_image: null,
  overlay_opacity: 30,
  show_clock: true,
  clock_color: '#ffffff',
  clock_size: 72,
  show_search_box: true,
  search_engine: 'google',
  show_shortcuts: true,
  shortcuts: defaultShortcuts,
  clock_position: { x: 50, y: 30 },
  search_position: { x: 50, y: 48 },
  shortcuts_position: { x: 50, y: 68 },
  // Background enhancements
  background_color: '#1a1a2e',
  background_fit: 'cover',
  background_blur: 0,
  background_brightness: 100,
  // Clock enhancements
  clock_format_24h: true,
  clock_show_seconds: false,
  clock_show_date: false,
  clock_font_weight: 'light',
  // Search box enhancements
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
  // Shortcuts enhancements
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
  // Clock fine-grained
  clock_shadow_color: '#000000',
  clock_shadow_blur: 10,
  clock_shadow_opacity: 30,
  clock_letter_spacing: 0,
  clock_font_family: 'system',
  // Overlay
  overlay_color: '#000000',
  // Advanced
  custom_css: '',
};

const defaultConfig: AppConfig = {
  firefox: {
    profile_path: null,
    enabled: true,
    settings: defaultSettings,
  },
  chrome: {
    extension_output_path: null,
    enabled: true,
    settings: defaultSettings,
  },
  custom_presets: [],
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: defaultConfig,
  firefoxSettings: defaultSettings,
  chromeSettings: defaultSettings,
  activeTab: 'firefox',
  firefoxInfo: null,
  chromeInfo: null,
  selectedProfile: '',
  prereqCheck: null,
  backups: [],
  isLoading: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const config = await invoke<AppConfig>('load_app_config');
      set({
        config,
        firefoxSettings: { ...defaultSettings, ...config.firefox.settings },
        chromeSettings: { ...defaultSettings, ...config.chrome.settings },
        selectedProfile: config.firefox.profile_path || '',
        isLoading: false,
      });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  saveConfig: async () => {
    set({ error: null });
    const { config, firefoxSettings, chromeSettings, selectedProfile } = get();
    const newConfig: AppConfig = {
      ...config,
      firefox: {
        ...config.firefox,
        profile_path: selectedProfile || null,
        settings: firefoxSettings,
      },
      chrome: {
        ...config.chrome,
        settings: chromeSettings,
      },
    };
    await invoke('save_app_config', { config: newConfig });
    set({ config: newConfig });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  updateSettings: (settings) => {
    const { activeTab } = get();
    if (activeTab === 'firefox') {
      set((state) => ({
        firefoxSettings: { ...state.firefoxSettings, ...settings },
      }));
    } else {
      set((state) => ({
        chromeSettings: { ...state.chromeSettings, ...settings },
      }));
    }
  },

  detectFirefox: async () => {
    set({ isLoading: true, error: null });
    try {
      const info = await invoke<BrowserInfo>('detect_firefox');
      set({ firefoxInfo: info, isLoading: false });

      if (info.profile_paths.length > 0) {
        const { selectedProfile } = get();
        if (!selectedProfile) {
          const defaultProfile = info.profile_paths.find((p) => p.is_default);
          set({
            selectedProfile: defaultProfile?.path || info.profile_paths[0].path,
          });
        }
      }
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  selectProfile: (path) => {
    set({ selectedProfile: path });
  },

  checkPrerequisites: async () => {
    const { selectedProfile } = get();
    if (!selectedProfile) return;

    set({ error: null });
    try {
      const check = await invoke<PrereqCheck>('check_firefox_prerequisites', {
        profilePath: selectedProfile,
      });
      set({ prereqCheck: check });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  applyFirefox: async () => {
    const { selectedProfile, firefoxSettings } = get();
    if (!selectedProfile) return;

    set({ isLoading: true, error: null });
    try {
      await invoke('apply_firefox_settings', {
        profilePath: selectedProfile,
        settings: firefoxSettings,
      });
      await get().saveConfig();
      set({ isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  autoFixPrerequisites: async () => {
    const { selectedProfile } = get();
    if (!selectedProfile) return;

    set({ error: null });
    try {
      await invoke('auto_fix_firefox_prerequisites', {
        profilePath: selectedProfile,
      });
      await get().checkPrerequisites();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  createBackup: async () => {
    const { selectedProfile } = get();
    if (!selectedProfile) return;

    set({ error: null });
    try {
      await invoke('backup_firefox', { profilePath: selectedProfile });
      await get().loadBackups();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  restoreBackup: async (name) => {
    const { selectedProfile } = get();
    if (!selectedProfile) return;

    set({ error: null });
    try {
      await invoke('restore_firefox', {
        profilePath: selectedProfile,
        backupName: name,
      });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  loadBackups: async () => {
    set({ error: null });
    try {
      const backups = await invoke<string[]>('list_firefox_backups');
      set({ backups });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteBackup: async (name: string) => {
    set({ error: null });
    try {
      await invoke('delete_firefox_backup', { backupName: name });
      await get().loadBackups();
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  // ── Chrome / Edge ──

  detectChrome: async () => {
    set({ error: null });
    try {
      const info = await invoke<ChromeDetectResult>('detect_chrome');
      set({ chromeInfo: info });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  applyChrome: async () => {
    const { chromeSettings } = get();
    set({ isLoading: true, error: null });
    try {
      const path = await invoke<string>('apply_chrome_settings', {
        settings: chromeSettings,
        imagePath: chromeSettings.background_image,
      });
      await get().saveConfig();
      const info = await invoke<ChromeDetectResult>('detect_chrome');
      set({ chromeInfo: info, isLoading: false });
      return path;
    } catch (e) {
      set({ error: String(e), isLoading: false });
      throw e;
    }
  },

  removeChrome: async () => {
    set({ isLoading: true, error: null });
    try {
      await invoke('remove_chrome_settings');
      const info = await invoke<ChromeDetectResult>('detect_chrome');
      set({ chromeInfo: info, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
      throw e;
    }
  },

  selectImage: async () => {
    set({ error: null });
    try {
      const path = await invoke<string | null>('select_image');
      if (path) {
        get().updateSettings({ background_image: path });
      }
      return path;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },

  exportSettings: async () => {
    const { activeTab, firefoxSettings, chromeSettings } = get();
    const settings = activeTab === 'firefox' ? firefoxSettings : chromeSettings;
    set({ error: null });
    try {
      await invoke('export_settings', { settings });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  importSettings: async () => {
    set({ error: null });
    try {
      const settings = await invoke<BrowserSettings | null>('import_settings');
      if (settings) {
        const merged = { ...defaultSettings, ...settings };
        const { activeTab } = get();
        if (activeTab === 'firefox') {
          set({ firefoxSettings: merged });
        } else {
          set({ chromeSettings: merged });
        }
      }
    } catch (e) {
      set({ error: String(e) });
    }
  },

  resetSettings: () => {
    const { activeTab } = get();
    if (activeTab === 'firefox') {
      set({ firefoxSettings: { ...defaultSettings } });
    } else {
      set({ chromeSettings: { ...defaultSettings } });
    }
  },

  savePreset: async (name: string) => {
    const { activeTab, firefoxSettings, chromeSettings, config } = get();
    const settings = activeTab === 'firefox' ? firefoxSettings : chromeSettings;
    const preset: NamedPreset = { name, settings: { ...settings } };
    const newConfig = {
      ...config,
      custom_presets: [...config.custom_presets, preset],
    };
    set({ config: newConfig });
    await invoke('save_app_config', { config: newConfig });
  },

  deletePreset: async (index: number) => {
    const { config } = get();
    const newPresets = config.custom_presets.filter((_, i) => i !== index);
    const newConfig = { ...config, custom_presets: newPresets };
    set({ config: newConfig });
    await invoke('save_app_config', { config: newConfig });
  },
}));
