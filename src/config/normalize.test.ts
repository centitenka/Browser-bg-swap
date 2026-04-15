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
      background_image_mode: 'weird' as never,
      background_fit: 'invalid',
      search_width: 9999,
      shortcuts: [{ title: '  ', url: '', icon: '' }],
      overlay_color: 'nope',
    });

    expect(normalized.overlay_opacity).toBe(100);
    expect(normalized.background_image_mode).toBe('managed');
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
        search_url_template: 'https://example.com/?q={query}',
        search_bg_color: '#112233',
        custom_css: 'body { color: red; }',
      },
    });

    expect(payload?.browser).toBe('chrome');
    expect(payload?.settings.show_clock).toBe(true);
    expect(payload?.settings.search_url_template).toBe('');
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
        search_url_template: 'https://example.com/?q={query}',
        custom_css: 'body { color: red; }',
      },
    });

    expect(warning?.code).toBe('import_trimmed_fields');
    expect(warning?.details).toEqual(expect.arrayContaining(['show_clock', 'search_engine', 'search_url_template', 'custom_css']));
  });
});

describe('normalizeAppConfig', () => {
  it('forces the current config version and normalizes nested settings', () => {
    const config = normalizeAppConfig({
      ...createDefaultAppConfig(),
      config_version: 1,
      firefox: {
        ...createDefaultAppConfig().firefox,
        selected_profile_path: 'C:/Users/test/Profile',
        profile_settings_by_key: {
          abc123: {
            ...createDefaultSettings(),
            show_clock: false,
          },
        },
        last_applied_by_profile_key: {
          abc123: {
            applied_at: '2026-04-15T12:00:00.000Z',
            settings: {
              ...createDefaultSettings(),
              show_clock: false,
              custom_css: 'body { color: red; }',
            },
          },
        },
      },
    });

    expect(config.config_version).toBe(CONFIG_VERSION);
    expect(config.firefox.profile_settings_by_key.abc123.show_clock).toBe(true);
    expect(config.firefox.last_applied_by_profile_key.abc123.settings.show_clock).toBe(true);
    expect(config.firefox.last_applied_by_profile_key.abc123.settings.custom_css).toBe('');
  });

  it('keeps custom presets scoped to their browser capability set', () => {
    const config = normalizeAppConfig({
      ...createDefaultAppConfig(),
      custom_presets: [
        {
          name: ' Firefox Imported ',
          browser: 'firefox',
          settings: {
            ...createDefaultSettings(),
            show_clock: false,
            custom_css: 'body { color: red; }',
          },
        },
      ],
    });

    expect(config.custom_presets[0].browser).toBe('firefox');
    expect(config.custom_presets[0].settings.show_clock).toBe(true);
    expect(config.custom_presets[0].settings.custom_css).toBe('');
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

  it('keeps recent images unique and trimmed', () => {
    const config = normalizeAppConfig({
      ...createDefaultAppConfig(),
      recent_background_images: [' C:/one.png ', 'c:/ONE.png', 'C:/two.png'],
    });

    expect(config.recent_background_images).toEqual(['C:/one.png', 'C:/two.png']);
  });

  it('keeps favorite images unique and trimmed', () => {
    const config = normalizeAppConfig({
      ...createDefaultAppConfig(),
      favorite_background_images: [' C:/fav.png ', 'c:/FAV.png', 'C:/other.png'],
    });

    expect(config.favorite_background_images).toEqual(['C:/fav.png', 'C:/other.png']);
  });

  it('drops invalid applied snapshots and normalizes the Chrome baseline', () => {
    const config = normalizeAppConfig({
      ...createDefaultAppConfig(),
      chrome: {
        settings: createDefaultSettings(),
        last_applied: {
          applied_at: ' 2026-04-15T12:00:00.000Z ',
          settings: {
            ...createDefaultSettings(),
            overlay_opacity: 999,
          },
        },
      },
      firefox: {
        ...createDefaultAppConfig().firefox,
        last_applied_by_profile_key: {
          abc123: {
            applied_at: '   ',
            settings: createDefaultSettings(),
          },
        },
      },
    });

    expect(config.chrome.last_applied?.applied_at).toBe('2026-04-15T12:00:00.000Z');
    expect(config.chrome.last_applied?.settings.overlay_opacity).toBe(100);
    expect(config.firefox.last_applied_by_profile_key).toEqual({});
  });
});
