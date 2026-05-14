import { describe, expect, it } from 'vitest';
import { sharedConfigSchema } from './defaults';
import { CONFIG_VERSION, createDefaultAppConfig, createDefaultSettings } from './defaults';
import {
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
    expect(normalized.search_width).toBe(sharedConfigSchema.numbers.search_width.max);
    expect(normalized.shortcuts.length).toBeGreaterThan(0);
    expect(normalized.overlay_color).toBe('#000000');
  });

  it('keeps shortcut folders while normalizing legacy links', () => {
    const normalized = normalizeBrowserSettings({
      shortcuts: [
        { title: ' GitHub ', url: ' https://github.com ', icon: '' },
        {
          kind: 'folder',
          title: ' Dev ',
          icon: 'D',
          children: [
            { title: ' Docs ', url: ' https://developer.mozilla.org ', icon: '' },
            { kind: 'folder', title: ' Nested ', icon: 'N', children: [] },
          ],
        },
      ],
    });

    expect(normalized.shortcuts[0]).toMatchObject({
      kind: 'link',
      title: 'GitHub',
      url: 'https://github.com',
      icon: '🔗',
    });
    expect(normalized.shortcuts[1]).toMatchObject({
      kind: 'folder',
      title: 'Dev',
      icon: 'D',
    });
    expect(normalized.shortcuts[1].children).toEqual([
      {
        kind: 'link',
        title: 'Docs',
        url: 'https://developer.mozilla.org',
        icon: '🔗',
        position: undefined,
      },
    ]);
  });

  it('filters empty folders and limits top-level and child shortcuts to sixteen', () => {
    const manyLinks = Array.from({ length: 20 }, (_, index) => ({
      title: `Link ${index}`,
      url: `https://example.com/${index}`,
      icon: 'L',
    }));

    const normalized = normalizeBrowserSettings({
      shortcuts: [
        { kind: 'folder', title: 'Empty', icon: 'E', children: [] },
        {
          kind: 'folder',
          title: 'Full',
          icon: 'F',
          children: manyLinks,
        },
        ...manyLinks,
      ],
    });

    expect(normalized.shortcuts).toHaveLength(16);
    expect(normalized.shortcuts.find((shortcut) => shortcut.title === 'Empty')).toBeUndefined();
    expect(normalized.shortcuts[0].children).toHaveLength(16);
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
        custom_css: 'body { color: red; }',
      },
    });

    expect(payload?.browser).toBe('chrome');
    expect(payload?.settings.show_clock).toBe(true);
    expect(payload?.settings.custom_css).toBe('');
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

  it('keeps Chrome settings fully featured', () => {
    const chromeSettings = projectSettingsForBrowser('chrome', normalizeBrowserSettings({
      show_clock: false,
      custom_css: 'body { color: white; }',
    }));

    expect(chromeSettings.show_clock).toBe(false);
    expect(chromeSettings.custom_css).toContain('color');
  });
});
