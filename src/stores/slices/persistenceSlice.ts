import { invoke } from '@tauri-apps/api/core';
import { CONFIG_VERSION, createDefaultAppConfig, createDefaultSettings } from '../../config/defaults';
import {
  normalizeAppConfig,
  normalizeBrowserSettings,
  projectSettingsForBrowser,
} from '../../config/normalize';
import type { AppConfig, BrowserSettings, BrowserTab, NamedPreset } from '../../types';
import type { PersistenceSlice, StoreSlice } from '../types';

function normalizeSettingsForTab(tab: BrowserTab, settings: Partial<BrowserSettings>): BrowserSettings {
  return projectSettingsForBrowser(tab, normalizeBrowserSettings(settings));
}

export const createPersistenceSlice: StoreSlice<PersistenceSlice> = (set, get) => ({
  config: createDefaultAppConfig(),
  firefoxSettings: createDefaultSettings(),
  chromeSettings: createDefaultSettings(),
  activeTab: 'firefox',
  selectedProfile: '',

  loadConfig: async () => {
    get().beginRequest();
    try {
      const config = normalizeAppConfig(await invoke<AppConfig>('load_app_config'));
      set({
        config,
        firefoxSettings: config.firefox.settings,
        chromeSettings: config.chrome.settings,
        selectedProfile: config.firefox.profile_path || '',
      });
      get().clearDirty('firefox');
      get().clearDirty('chrome');
      get().resetActionState('firefox');
      get().resetActionState('chrome');
    } finally {
      get().endRequest();
    }
  },

  saveConfig: async (tab) => {
    const { config, firefoxSettings, chromeSettings, selectedProfile } = get();
    const nextConfig = normalizeAppConfig({
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

    await invoke('save_app_config', { config: nextConfig });
    set({ config: nextConfig });

    if (tab) {
      get().clearDirty(tab);
    }
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

    get().setDirty(activeTab, true);
  },

  replaceSettings: (tab, settings, markDirty = true) => {
    if (tab === 'firefox') {
      set({
        firefoxSettings: normalizeSettingsForTab('firefox', settings),
      });
    } else {
      set({
        chromeSettings: normalizeSettingsForTab('chrome', settings),
      });
    }

    if (markDirty) {
      get().setDirty(tab, true);
    }
  },

  selectProfile: (path, markDirty = true) => {
    set({ selectedProfile: path });
    if (markDirty) {
      get().setDirty('firefox', true);
    }
  },

  resetSettings: () => {
    const { activeTab } = get();
    const defaults = normalizeSettingsForTab(activeTab, createDefaultSettings());

    if (activeTab === 'firefox') {
      set({ firefoxSettings: defaults });
    } else {
      set({ chromeSettings: defaults });
    }

    get().setDirty(activeTab, true);
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
    const nextConfig = normalizeAppConfig({
      ...config,
      custom_presets: [...config.custom_presets, preset],
    });

    set({ config: nextConfig });
    await invoke('save_app_config', { config: nextConfig });
  },

  deletePreset: async (index) => {
    const { config } = get();
    const nextConfig = normalizeAppConfig({
      ...config,
      custom_presets: config.custom_presets.filter((_, presetIndex) => presetIndex !== index),
    });

    set({ config: nextConfig });
    await invoke('save_app_config', { config: nextConfig });
  },
});
