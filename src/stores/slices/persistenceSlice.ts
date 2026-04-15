import { invoke } from '@tauri-apps/api/core';
import { CONFIG_VERSION, createDefaultAppConfig, createDefaultSettings } from '../../config/defaults';
import {
  normalizeAppConfig,
  normalizeBrowserSettings,
  projectSettingsForBrowser,
} from '../../config/normalize';
import type {
  AppliedSettingsSnapshot,
  AppConfig,
  BrowserSettings,
  BrowserTab,
  NamedPreset,
} from '../../types';
import type { ConfigStoreState, PersistenceSlice, StoreSlice } from '../types';

function normalizeSettingsForTab(tab: BrowserTab, settings: Partial<BrowserSettings>): BrowserSettings {
  return projectSettingsForBrowser(tab, normalizeBrowserSettings(settings));
}

function normalizeSnapshot(
  tab: BrowserTab,
  snapshot: AppliedSettingsSnapshot | null | undefined
): AppliedSettingsSnapshot | null {
  if (!snapshot?.applied_at) {
    return null;
  }

  const appliedAt = snapshot.applied_at.trim();
  if (!appliedAt) {
    return null;
  }

  return {
    applied_at: appliedAt,
    settings: normalizeSettingsForTab(tab, snapshot.settings),
  };
}

function areSettingsEqual(tab: BrowserTab, left: BrowserSettings, right: BrowserSettings): boolean {
  return JSON.stringify(normalizeSettingsForTab(tab, left)) === JSON.stringify(normalizeSettingsForTab(tab, right));
}

function upsertRecentImage(list: string[], path: string): string[] {
  const normalized = path.trim();
  if (!normalized) {
    return list;
  }

  return [normalized, ...list.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 12);
}

function toggleFavoriteImagePath(list: string[], path: string): { next: string[]; favorited: boolean } {
  const normalized = path.trim();
  if (!normalized) {
    return { next: list, favorited: false };
  }

  const exists = list.some((item) => item.toLowerCase() === normalized.toLowerCase());
  if (exists) {
    return {
      next: list.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
      favorited: false,
    };
  }

  return {
    next: [normalized, ...list].slice(0, 24),
    favorited: true,
  };
}

function resolveFirefoxSettings(config: AppConfig, selectedProfileKey: string | null): BrowserSettings {
  if (selectedProfileKey && config.firefox.profile_settings_by_key[selectedProfileKey]) {
    return normalizeSettingsForTab('firefox', config.firefox.profile_settings_by_key[selectedProfileKey]);
  }

  const firstEntry = Object.values(config.firefox.profile_settings_by_key)[0];
  return normalizeSettingsForTab('firefox', firstEntry ?? createDefaultSettings());
}

function resolveAppliedSnapshot(
  tab: BrowserTab,
  config: AppConfig,
  selectedProfileKey: string | null
): AppliedSettingsSnapshot | null {
  if (tab === 'firefox') {
    return selectedProfileKey
      ? normalizeSnapshot('firefox', config.firefox.last_applied_by_profile_key[selectedProfileKey])
      : null;
  }

  return normalizeSnapshot('chrome', config.chrome.last_applied);
}

function computeDirtyForTab(
  tab: BrowserTab,
  config: AppConfig,
  firefoxSettings: BrowserSettings,
  chromeSettings: BrowserSettings,
  selectedProfileKey: string | null
): boolean {
  const current = tab === 'firefox' ? firefoxSettings : chromeSettings;
  const applied = resolveAppliedSnapshot(tab, config, selectedProfileKey);
  const baseline = applied?.settings ?? normalizeSettingsForTab(tab, createDefaultSettings());

  return !areSettingsEqual(tab, current, baseline);
}

function resolveDirtyRecord(
  config: AppConfig,
  firefoxSettings: BrowserSettings,
  chromeSettings: BrowserSettings,
  selectedProfileKey: string | null
): Record<BrowserTab, boolean> {
  return {
    firefox: computeDirtyForTab('firefox', config, firefoxSettings, chromeSettings, selectedProfileKey),
    chrome: computeDirtyForTab('chrome', config, firefoxSettings, chromeSettings, selectedProfileKey),
  };
}

function commitFirefoxSettingsToConfig(
  config: AppConfig,
  profileKey: string | null,
  settings: BrowserSettings,
  selectedProfile: string
): AppConfig {
  return normalizeAppConfig({
    ...config,
    firefox: {
      ...config.firefox,
      selected_profile_path: selectedProfile || null,
      profile_settings_by_key: profileKey
        ? {
            ...config.firefox.profile_settings_by_key,
            [profileKey]: normalizeSettingsForTab('firefox', settings),
          }
        : config.firefox.profile_settings_by_key,
    },
  });
}

function markAppliedInConfig(
  tab: BrowserTab,
  config: AppConfig,
  settings: BrowserSettings,
  selectedProfileKey: string | null
): AppConfig {
  const applied_at = new Date().toISOString();

  if (tab === 'firefox') {
    if (!selectedProfileKey) {
      return config;
    }

    return normalizeAppConfig({
      ...config,
      firefox: {
        ...config.firefox,
        last_applied_by_profile_key: {
          ...config.firefox.last_applied_by_profile_key,
          [selectedProfileKey]: {
            applied_at,
            settings: normalizeSettingsForTab('firefox', settings),
          },
        },
      },
    });
  }

  return normalizeAppConfig({
    ...config,
    chrome: {
      ...config.chrome,
      last_applied: {
        applied_at,
        settings: normalizeSettingsForTab('chrome', settings),
      },
    },
  });
}

function clearAppliedInConfig(
  tab: BrowserTab,
  config: AppConfig,
  selectedProfileKey: string | null
): AppConfig {
  if (tab === 'firefox') {
    if (!selectedProfileKey) {
      return config;
    }

    const nextApplied = { ...config.firefox.last_applied_by_profile_key };
    delete nextApplied[selectedProfileKey];

    return normalizeAppConfig({
      ...config,
      firefox: {
        ...config.firefox,
        last_applied_by_profile_key: nextApplied,
      },
    });
  }

  return normalizeAppConfig({
    ...config,
    chrome: {
      ...config.chrome,
      last_applied: null,
    },
  });
}

function createStateWithDirty(
  next: Pick<ConfigStoreState, 'config' | 'firefoxSettings' | 'chromeSettings' | 'selectedProfileKey'>
): Pick<ConfigStoreState, 'dirtyByTab'> {
  return {
    dirtyByTab: resolveDirtyRecord(
      next.config,
      next.firefoxSettings,
      next.chromeSettings,
      next.selectedProfileKey
    ),
  };
}

export const createPersistenceSlice: StoreSlice<PersistenceSlice> = (set, get) => ({
  config: createDefaultAppConfig(),
  firefoxSettings: createDefaultSettings(),
  chromeSettings: createDefaultSettings(),
  activeTab: 'firefox',
  selectedProfile: '',
  selectedProfileKey: null,

  loadConfig: async () => {
    get().beginRequest();
    try {
      const config = normalizeAppConfig(await invoke<AppConfig>('load_app_config'));
      const selectedProfile = config.firefox.selected_profile_path || '';
      const selectedProfileKey = null;
      const firefoxSettings = resolveFirefoxSettings(config, selectedProfileKey);
      const chromeSettings = config.chrome.settings;

      set({
        config,
        firefoxSettings,
        chromeSettings,
        selectedProfile,
        selectedProfileKey,
        ...createStateWithDirty({
          config,
          firefoxSettings,
          chromeSettings,
          selectedProfileKey,
        }),
      });
      get().resetActionState('firefox');
      get().resetActionState('chrome');
    } finally {
      get().endRequest();
    }
  },

  saveConfig: async () => {
    const { config, firefoxSettings, chromeSettings, selectedProfile, selectedProfileKey } = get();
    const nextConfig = normalizeAppConfig({
      ...config,
      config_version: CONFIG_VERSION,
      firefox: {
        ...config.firefox,
        selected_profile_path: selectedProfile || null,
        profile_settings_by_key: selectedProfileKey
          ? {
              ...config.firefox.profile_settings_by_key,
              [selectedProfileKey]: normalizeSettingsForTab('firefox', firefoxSettings),
            }
          : config.firefox.profile_settings_by_key,
      },
      chrome: {
        ...config.chrome,
        settings: chromeSettings,
      },
    });

    await invoke('save_app_config', { config: nextConfig });
    set({
      config: nextConfig,
      ...createStateWithDirty({
        config: nextConfig,
        firefoxSettings,
        chromeSettings,
        selectedProfileKey,
      }),
    });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  updateSettings: (settings) => {
    const { activeTab, selectedProfileKey, selectedProfile } = get();
    if (activeTab === 'firefox') {
      set((state) => {
        const firefoxSettings = normalizeSettingsForTab('firefox', {
          ...state.firefoxSettings,
          ...settings,
        });
        const config = commitFirefoxSettingsToConfig(
          state.config,
          selectedProfileKey,
          firefoxSettings,
          selectedProfile
        );

        return {
          firefoxSettings,
          config,
          ...createStateWithDirty({
            config,
            firefoxSettings,
            chromeSettings: state.chromeSettings,
            selectedProfileKey,
          }),
        };
      });
      return;
    }

    set((state) => {
      const chromeSettings = normalizeSettingsForTab('chrome', {
        ...state.chromeSettings,
        ...settings,
      });
      const config = normalizeAppConfig({
        ...state.config,
        chrome: {
          ...state.config.chrome,
          settings: chromeSettings,
        },
      });

      return {
        chromeSettings,
        config,
        ...createStateWithDirty({
          config,
          firefoxSettings: state.firefoxSettings,
          chromeSettings,
          selectedProfileKey: state.selectedProfileKey,
        }),
      };
    });
  },

  replaceSettings: (tab, settings) => {
    if (tab === 'firefox') {
      const { selectedProfileKey, selectedProfile } = get();
      const firefoxSettings = normalizeSettingsForTab('firefox', settings);
      set((state) => {
        const config = commitFirefoxSettingsToConfig(
          state.config,
          selectedProfileKey,
          firefoxSettings,
          selectedProfile
        );

        return {
          firefoxSettings,
          config,
          ...createStateWithDirty({
            config,
            firefoxSettings,
            chromeSettings: state.chromeSettings,
            selectedProfileKey,
          }),
        };
      });
      return;
    }

    const chromeSettings = normalizeSettingsForTab('chrome', settings);
    set((state) => {
      const config = normalizeAppConfig({
        ...state.config,
        chrome: {
          ...state.config.chrome,
          settings: chromeSettings,
        },
      });

      return {
        chromeSettings,
        config,
        ...createStateWithDirty({
          config,
          firefoxSettings: state.firefoxSettings,
          chromeSettings,
          selectedProfileKey: state.selectedProfileKey,
        }),
      };
    });
  },

  selectProfile: (path) => {
    const { firefoxInfo, selectedProfileKey, firefoxSettings, config } = get();
    const nextProfile = firefoxInfo?.profile_paths.find((profile) => profile.path === path) ?? null;
    const committedConfig = commitFirefoxSettingsToConfig(
      config,
      selectedProfileKey,
      firefoxSettings,
      get().selectedProfile
    );
    const nextKey = nextProfile?.key ?? null;
    const nextSettings = resolveFirefoxSettings(committedConfig, nextKey);
    const nextConfig = normalizeAppConfig({
      ...committedConfig,
      firefox: {
        ...committedConfig.firefox,
        selected_profile_path: path || null,
      },
    });

    set({
      config: nextConfig,
      selectedProfile: path,
      selectedProfileKey: nextKey,
      firefoxSettings: nextSettings,
      ...createStateWithDirty({
        config: nextConfig,
        firefoxSettings: nextSettings,
        chromeSettings: get().chromeSettings,
        selectedProfileKey: nextKey,
      }),
    });
  },

  resetSettings: () => {
    const { activeTab } = get();
    const defaults = normalizeSettingsForTab(activeTab, createDefaultSettings());

    if (activeTab === 'firefox') {
      const { selectedProfileKey, selectedProfile } = get();
      set((state) => {
        const config = commitFirefoxSettingsToConfig(
          state.config,
          selectedProfileKey,
          defaults,
          selectedProfile
        );

        return {
          firefoxSettings: defaults,
          config,
          ...createStateWithDirty({
            config,
            firefoxSettings: defaults,
            chromeSettings: state.chromeSettings,
            selectedProfileKey,
          }),
        };
      });
      return;
    }

    set((state) => {
      const config = normalizeAppConfig({
        ...state.config,
        chrome: {
          ...state.config.chrome,
          settings: defaults,
        },
      });

      return {
        chromeSettings: defaults,
        config,
        ...createStateWithDirty({
          config,
          firefoxSettings: state.firefoxSettings,
          chromeSettings: defaults,
          selectedProfileKey: state.selectedProfileKey,
        }),
      };
    });
  },

  markAppliedSnapshot: (tab) => {
    const { config, firefoxSettings, chromeSettings, selectedProfileKey } = get();
    const settings = tab === 'firefox' ? firefoxSettings : chromeSettings;
    const nextConfig = markAppliedInConfig(tab, config, settings, selectedProfileKey);

    set({
      config: nextConfig,
      ...createStateWithDirty({
        config: nextConfig,
        firefoxSettings,
        chromeSettings,
        selectedProfileKey,
      }),
    });
  },

  clearAppliedSnapshot: (tab) => {
    const { config, firefoxSettings, chromeSettings, selectedProfileKey } = get();
    const nextConfig = clearAppliedInConfig(tab, config, selectedProfileKey);

    set({
      config: nextConfig,
      ...createStateWithDirty({
        config: nextConfig,
        firefoxSettings,
        chromeSettings,
        selectedProfileKey,
      }),
    });
  },

  savePreset: async (browser, name, overwrite = true) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const { firefoxSettings, chromeSettings, config } = get();
    const preset: NamedPreset = {
      name: trimmedName,
      browser,
      settings: normalizeSettingsForTab(
        browser,
        browser === 'firefox' ? firefoxSettings : chromeSettings
      ),
    };
    const existingIndex = config.custom_presets.findIndex(
      (item) =>
        item.browser === browser &&
        item.name.toLowerCase() === trimmedName.toLowerCase()
    );

    const custom_presets = [...config.custom_presets];
    if (existingIndex >= 0) {
      if (!overwrite) {
        return;
      }
      custom_presets[existingIndex] = preset;
    } else {
      custom_presets.push(preset);
    }

    const nextConfig = normalizeAppConfig({
      ...config,
      custom_presets,
    });

    set({ config: nextConfig });
    await invoke('save_app_config', { config: nextConfig });
  },

  renamePreset: async (index, name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const { config } = get();
    const custom_presets = config.custom_presets.map((preset, presetIndex) =>
      presetIndex === index ? { ...preset, name: trimmedName } : preset
    );
    const nextConfig = normalizeAppConfig({
      ...config,
      custom_presets,
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

  recordRecentImage: (path) => {
    set((state) => ({
      config: normalizeAppConfig({
        ...state.config,
        recent_background_images: upsertRecentImage(state.config.recent_background_images, path),
      }),
    }));
  },

  toggleFavoriteImage: async (path) => {
    const { config } = get();
    const { next, favorited } = toggleFavoriteImagePath(config.favorite_background_images, path);
    const nextConfig = normalizeAppConfig({
      ...config,
      favorite_background_images: next,
    });

    set({ config: nextConfig });
    await invoke('save_app_config', { config: nextConfig });
    return favorited;
  },
});
