import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { AppConfig, BrowserSettings, BrowserInfo, PrereqCheck } from '../types';

interface ConfigState {
  config: AppConfig;
  currentSettings: BrowserSettings;
  firefoxInfo: BrowserInfo | null;
  selectedProfile: string;
  prereqCheck: PrereqCheck | null;
  backups: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;
  updateSettings: (settings: Partial<BrowserSettings>) => void;
  detectFirefox: () => Promise<void>;
  selectProfile: (path: string) => void;
  checkPrerequisites: () => Promise<void>;
  applyFirefox: () => Promise<void>;
  autoFixPrerequisites: () => Promise<void>;
  createBackup: () => Promise<void>;
  restoreBackup: (name: string) => Promise<void>;
  loadBackups: () => Promise<void>;
  deleteBackup?: (name: string) => Promise<void>;
  generateChromeExtension: (outputPath: string) => Promise<string>;
  selectImage: () => Promise<string | null>;
}

const defaultSettings: BrowserSettings = {
  background_image: null,
  show_search_box: true,
  show_shortcuts: true,
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
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: defaultConfig,
  currentSettings: defaultSettings,
  firefoxInfo: null,
  selectedProfile: '',
  prereqCheck: null,
  backups: [],
  isLoading: false,
  error: null,

  loadConfig: async () => {
    set({ isLoading: true });
    try {
      const config = await invoke<AppConfig>('load_app_config');
      set({
        config,
        currentSettings: config.firefox.settings,
        isLoading: false,
      });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  saveConfig: async () => {
    const { config, currentSettings } = get();
    const newConfig: AppConfig = {
      ...config,
      firefox: {
        ...config.firefox,
        settings: currentSettings,
      },
      chrome: {
        ...config.chrome,
        settings: currentSettings,
      },
    };
    await invoke('save_app_config', { config: newConfig });
    set({ config: newConfig });
  },

  updateSettings: (settings) => {
    set((state) => ({
      currentSettings: { ...state.currentSettings, ...settings },
    }));
  },

  detectFirefox: async () => {
    set({ isLoading: true });
    try {
      const info = await invoke<BrowserInfo>('detect_firefox');
      set({ firefoxInfo: info, isLoading: false });

      if (info.profile_paths.length > 0) {
        const defaultProfile = info.profile_paths.find((p) => p.is_default);
        set({
          selectedProfile: defaultProfile?.path || info.profile_paths[0].path,
        });
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
    const { selectedProfile, currentSettings } = get();
    if (!selectedProfile) return;

    set({ isLoading: true });
    try {
      await invoke('apply_firefox_settings', {
        profilePath: selectedProfile,
        settings: currentSettings,
      });
      set({ isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  autoFixPrerequisites: async () => {
    const { selectedProfile } = get();
    if (!selectedProfile) return;

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
    try {
      const backups = await invoke<string[]>('list_firefox_backups');
      set({ backups });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteBackup: async (name: string) => {
    try {
      await invoke('delete_firefox_backup', { backupName: name });
      await get().loadBackups();
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  generateChromeExtension: async (outputPath: string) => {
    const { currentSettings } = get();
    try {
      const result = await invoke<string>('generate_chrome_extension', {
        outputPath,
        settings: currentSettings,
        imagePath: currentSettings.background_image,
      });
      return result;
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  selectImage: async () => {
    try {
      const path = await invoke<string | null>('select_image');
      if (path) {
        set((state) => ({
          currentSettings: { ...state.currentSettings, background_image: path },
        }));
      }
      return path;
    } catch (e) {
      set({ error: String(e) });
      return null;
    }
  },
}));
