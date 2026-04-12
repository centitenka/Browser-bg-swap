import { describe, expect, it } from 'vitest';
import { createT } from './index';

describe('createT', () => {
  it('switches between English and Chinese locales', () => {
    const en = createT('en');
    const zh = createT('zh');

    expect(en('common.confirm')).toBe('Confirm');
    expect(zh('common.confirm')).toBe('确认');
  });

  it('interpolates variables in translated strings', () => {
    const t = createT('en');
    expect(t('backup.savedCount', { count: '3' })).toBe('3 saved');
  });
});
