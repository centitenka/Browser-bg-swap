import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultSettings } from '../../../config/defaults';
import { I18nContext, createT } from '../../../i18n';
import { ShortcutsSection } from './ShortcutsSection';

function renderSection(onChange = vi.fn()) {
  const settings = {
    ...createDefaultSettings(),
    shortcuts: [
      { kind: 'link' as const, title: 'GitHub', url: 'https://github.com', icon: 'G' },
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
      <ShortcutsSection
        settings={settings}
        expanded={false}
        onToggle={() => {}}
        onChange={onChange}
      />
    </I18nContext.Provider>
  );

  return { onChange, settings };
}

describe('ShortcutsSection', () => {
  it('adds folders and edits child links', () => {
    const { onChange } = renderSection();

    fireEvent.click(screen.getByText('Add Folder'));
    expect(onChange).toHaveBeenCalledWith({
      shortcuts: expect.arrayContaining([
        expect.objectContaining({ kind: 'folder', title: 'Folder', children: [] }),
      ]),
    });

    fireEvent.click(screen.getByText('Dev'));
    expect(screen.getByText('Back to shortcuts')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Docs')).toBeInTheDocument();
  });

  it('reorders and deletes shortcuts', () => {
    const { onChange } = renderSection();

    fireEvent.click(screen.getAllByLabelText('Move shortcut down')[0]);
    expect(onChange).toHaveBeenCalledWith({
      shortcuts: [
        expect.objectContaining({ title: 'Dev' }),
        expect.objectContaining({ title: 'GitHub' }),
      ],
    });

    fireEvent.click(screen.getAllByLabelText('Delete shortcut')[0]);
    expect(onChange).toHaveBeenLastCalledWith({
      shortcuts: [expect.objectContaining({ title: 'Dev' })],
    });
  });
});
