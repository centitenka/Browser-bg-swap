import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { CONFIG_VERSION, createDefaultAppConfig, createDefaultSettings } from '../config/defaults';
import {
  normalizeAppConfig,
  normalizeBrowserSettings,
  normalizeImportedSettings,
  projectSettingsForBrowser,
} from '../config/normalize';
import type {
  AppConfig,
  BrowserSettings,
  BrowserInfo,
  BrowserTab,
  ChromeDetectResult,
  NamedPreset,
  PrereqCheck,
  SettingsExchangeFile,
} from '../types';

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

const defaultConfig = createDefaultAppConfig();

function normalizeSettingsForTab(tab: BrowserTab, settings: Partial<BrowserSettings>): BrowserSettings {
  return projectSettingsForBrowser(tab, normalizeBrowserSettings(settings));
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: defaultConfig,
  firefoxSettings: createDefaultSettings(),
  chromeSettings: createDefaultSettings(),
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
      const config = normalizeAppConfig(await invoke<AppConfig>('load_app_config'));
      set({
        config,
        firefoxSettings: config.firefox.settings,
        chromeSettings: config.chrome.settings,
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
    const newConfig = normalizeAppConfig({
      ...config,
      config_version: CONFIG_VERSION,
      firefox: {
        ...config.firefox,
        profile_path: selectedProfile || null,
        settings: firefoxSettings,
      },
      chrome: {
        ...config.chrome,
        settings: chromeSettings,
      },
    });
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
        firefoxSettings: normalizeSettingsForTab('firefox', {
          ...state.firefoxSettings,
          ...settings,
        }),
      }));
    } else {
      set((state) => ({
        chromeSettings: normalizeSettingsForTab('chrome', {
          ...state.chromeSettings,
          ...settings,
        }),
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
          const defaultProfile = info.profile_paths.find((profile) => profile.is_default);
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
    if (!selectedProfile) {
      return;
    }

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
    if (!selectedProfile) {
      return;
    }

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
    if (!selectedProfile) {
      return;
    }

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
    if (!selectedProfile) {
      return;
    }

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
    if (!selectedProfile) {
      return;
    }

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
    const { selectedProfile } = get();
    if (!selectedProfile) {
      set({ backups: [] });
      return;
    }

    set({ error: null });
    try {
      const backups = await invoke<string[]>('list_firefox_backups', {
        profilePath: selectedProfile,
      });
      set({ backups });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteBackup: async (name) => {
    const { selectedProfile } = get();
    if (!selectedProfile) {
      return;
    }

    set({ error: null });
    try {
      await invoke('delete_firefox_backup', {
        profilePath: selectedProfile,
        backupName: name,
      });
      await get().loadBackups();
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

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
      await invoke('export_settings', {
        browser: activeTab,
        settings,
      });
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  importSettings: async () => {
    const { activeTab } = get();
    set({ error: null });
    try {
      const payload = normalizeImportedSettings(
        activeTab,
        await invoke<SettingsExchangeFile | null>('import_settings')
      );

      if (!payload) {
        return;
      }

      if (activeTab === 'firefox') {
        set({ firefoxSettings: payload.settings });
      } else {
        set({ chromeSettings: payload.settings });
      }
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  resetSettings: () => {
    const { activeTab } = get();
    if (activeTab === 'firefox') {
      set({ firefoxSettings: normalizeSettingsForTab('firefox', createDefaultSettings()) });
    } else {
      set({ chromeSettings: normalizeSettingsForTab('chrome', createDefaultSettings()) });
    }
  },

  savePreset: async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const { chromeSettings, config } = get();
    const preset: NamedPreset = {
      name: trimmedName,
      settings: normalizeSettingsForTab('chrome', chromeSettings),
    };
    const newConfig = normalizeAppConfig({
      ...config,
      custom_presets: [...config.custom_presets, preset],
    });
    set({ config: newConfig });
    await invoke('save_app_config', { config: newConfig });
  },

  deletePreset: async (index) => {
    const { config } = get();
    const newConfig = normalizeAppConfig({
      ...config,
      custom_presets: config.custom_presets.filter((_, presetIndex) => presetIndex !== index),
    });
    set({ config: newConfig });
    await invoke('save_app_config', { config: newConfig });
  },
}));
