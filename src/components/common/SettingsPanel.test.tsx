import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { browserCapabilities } from '../../config/capabilities';
import { createDefaultSettings } from '../../config/defaults';
import { I18nContext, createT } from '../../i18n';
import { SettingsPanel } from './SettingsPanel';

vi.mock('./ImagePicker', () => ({
  ImagePicker: () => <div>ImagePicker</div>,
}));

vi.mock('./Switch', () => ({
  Switch: ({ label, description }: { label: string; description: string }) => (
    <div>
      <span>{label}</span>
      <span>{description}</span>
    </div>
  ),
}));

describe('SettingsPanel', () => {
  it('renders only Firefox-supported controls', () => {
    render(
      <I18nContext.Provider value={{ lang: 'en', setLang: () => {}, t: createT('en') }}>
        <SettingsPanel
          settings={createDefaultSettings()}
          onChange={() => {}}
          onSelectImage={() => {}}
          capabilities={browserCapabilities.firefox}
        />
      </I18nContext.Provider>
    );

    expect(screen.getByText('Display options')).toBeInTheDocument();
    expect(screen.getByText('Show search box')).toBeInTheDocument();
    expect(screen.queryByText('Clock')).not.toBeInTheDocument();
    expect(screen.queryByText('Custom CSS')).not.toBeInTheDocument();
  });
});
