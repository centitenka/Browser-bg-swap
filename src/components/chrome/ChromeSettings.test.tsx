import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultSettings } from '../../config/defaults';
import { I18nContext, createT } from '../../i18n';
import { ChromeSettings } from './ChromeSettings';

describe('ChromeSettings', () => {
  it('shows full theme support status and background gradient controls', () => {
    render(
      <I18nContext.Provider value={{ lang: 'en', setLang: () => {}, t: createT('en') }}>
        <ChromeSettings
          settings={createDefaultSettings()}
          onChange={vi.fn()}
          onSelectImage={vi.fn()}
        />
      </I18nContext.Provider>
    );

    expect(screen.getAllByText('Chrome/Edge full')).not.toHaveLength(0);
    expect(screen.getByText('Gradient')).toBeInTheDocument();
  });
});
