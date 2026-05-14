import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultSettings } from '../../config/defaults';
import { I18nContext, createT } from '../../i18n';
import { NtpPreview } from './NtpPreview';

vi.mock('@tauri-apps/api/core', () => ({
  convertFileSrc: (path: string) => path,
}));

describe('NtpPreview', () => {
  it('opens a shortcut folder grid and returns to the top level', () => {
    const settings = {
      ...createDefaultSettings(),
      shortcuts: [
        {
          kind: 'folder' as const,
          title: 'Dev',
          icon: 'D',
          children: [
            { kind: 'link' as const, title: 'Docs', url: 'https://docs.example.com', icon: 'D' },
          ],
        },
      ],
    };

    render(
      <I18nContext.Provider value={{ lang: 'en', setLang: () => {}, t: createT('en') }}>
        <NtpPreview settings={settings} onPositionChange={() => {}} />
      </I18nContext.Provider>
    );

    expect(screen.queryByText('Docs')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Dev'));

    expect(screen.getByText('Docs')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));

    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.queryByText('Docs')).not.toBeInTheDocument();
  });
});
