import { describe, expect, it } from 'vitest';
import { CONFIG_VERSION, createDefaultAppConfig, createDefaultSettings } from './defaults';
import type { AppConfig } from '../types';
import {
  createImportProjectionWarning,
  normalizeAppConfig,
  normalizeBrowserSettings,
  normalizeImportedSettings,
  projectSettingsForBrowser,
} from './normalize';

describe('normalizeBrowserSettings', () => {
  it('clamps and sanitizes invalid values', () => {
    const normalized = normalizeBrowserSettings({
      overlay_opacity: 999,
      background_fit: 'invalid',
      search_width: 9999,
      shortcuts: [{ title: '  ', url: '', icon: '' }],
      overlay_color: 'nope',
    });

    expect(normalized.overlay_opacity).toBe(100);
    expect(normalized.background_fit).toBe('cover');
    expect(normalized.search_width).toBe(800);
    expect(normalized.shortcuts.length).toBeGreaterThan(0);
    expect(normalized.overlay_color).toBe('#000000');
  });
});

describe('normalizeImportedSettings', () => {
  it('projects unsupported Chrome-only settings away for Firefox imports', () => {
    const payload = normalizeImportedSettings('firefox', {
      version: 1,
      browser: 'chrome',
      settings: {
        ...createDefaultSettings(),
        show_clock: false,
        clock_size: 120,
        search_bg_color: '#112233',
        custom_css: 'body { color: red; }',
      },
    });

    expect(payload?.browser).toBe('chrome');
    expect(payload?.settings.show_clock).toBe(true);
    expect(payload?.settings.search_bg_color).toBe('#112233');
    expect(payload?.settings.custom_css).toBe('');
  });

  it('reports which imported settings were projected away', () => {
    const warning = createImportProjectionWarning('firefox', {
      version: 1,
      browser: 'chrome',
      settings: {
        ...createDefaultSettings(),
        show_clock: false,
        search_engine: 'bing',
        custom_css: 'body { color: red; }',
      },
    });

    expect(warning?.code).toBe('import_trimmed_fields');
    expect(warning?.details).toEqual(expect.arrayContaining(['show_clock', 'search_engine', 'custom_css']));
  });
});

describe('normalizeAppConfig', () => {
  it('forces the current config version and normalizes nested settings', () => {
    const config = normalizeAppConfig({
      ...createDefaultAppConfig(),
      config_version: 1,
      firefox: {
        ...createDefaultAppConfig().firefox,
        settings: {
          ...createDefaultSettings(),
          show_clock: false,
        },
      },
    });

    expect(config.config_version).toBe(CONFIG_VERSION);
    expect(config.firefox.settings.show_clock).toBe(true);
  });

  it('drops deprecated config fields while keeping usable settings', () => {
    const legacyConfig = {
      ...createDefaultAppConfig(),
      config_version: 2,
      firefox: {
        ...createDefaultAppConfig().firefox,
        enabled: false,
      },
      chrome: {
        ...createDefaultAppConfig().chrome,
        enabled: false,
        extension_output_path: 'C:/tmp/extension',
      },
    } as unknown as AppConfig;

    const config = normalizeAppConfig(legacyConfig);

    expect(config.config_version).toBe(CONFIG_VERSION);
    expect('enabled' in config.firefox).toBe(false);
    expect('enabled' in config.chrome).toBe(false);
    expect('extension_output_path' in config.chrome).toBe(false);
  });

  it('keeps Chrome settings fully featured', () => {
    const chromeSettings = projectSettingsForBrowser('chrome', normalizeBrowserSettings({
      show_clock: false,
      custom_css: 'body { color: white; }',
    }));

    expect(chromeSettings.show_clock).toBe(false);
    expect(chromeSettings.custom_css).toContain('color');
  });
});
