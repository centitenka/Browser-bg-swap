import type { AppConfig, BrowserSettings, Shortcut } from '../types';
import defaultSettingsJson from '../shared/defaultSettings.json';
import configSchemaJson from '../shared/configSchema.json';

export type SharedConfigSchema = {
  configVersion: number;
  numbers: Record<string, { min: number; max: number }>;
  enums: Record<string, string[]>;
};

export const sharedConfigSchema = configSchemaJson as SharedConfigSchema;
export const CONFIG_VERSION = sharedConfigSchema.configVersion;

const defaultSettings = defaultSettingsJson as BrowserSettings;

function cloneDefaultSettings(): BrowserSettings {
  return JSON.parse(JSON.stringify(defaultSettings)) as BrowserSettings;
}

export function createDefaultShortcuts(): Shortcut[] {
  return cloneDefaultSettings().shortcuts;
}

export function createDefaultSettings(): BrowserSettings {
  return cloneDefaultSettings();
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
