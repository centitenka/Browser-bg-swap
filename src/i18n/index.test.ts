import { describe, expect, it } from 'vitest';
import { createT } from './index';
import en from './en';
import zh from './zh';

describe('createT', () => {
  it('switches between English and Chinese locales', () => {
    const tEn = createT('en');
    const tZh = createT('zh');

    expect(tEn('nav.settings')).toBe('Settings');
    expect(tZh('nav.settings')).toBe('\u8BBE\u7F6E');
  });

  it('interpolates variables in translated strings', () => {
    const tEn = createT('en');

    expect(tEn('common.copied', { label: 'Path' })).toBe('Path copied!');
  });

  it('keeps English and Chinese locale keys aligned', () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
  });
});
