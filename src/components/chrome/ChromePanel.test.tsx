import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultSettings } from '../../config/defaults';
import { I18nContext, createT } from '../../i18n';
import { ChromePanel } from './ChromePanel';

const resetSettings = vi.fn();
const detectChrome = vi.fn();

vi.mock('../../stores/configStore', () => ({
  useConfigStore: () => ({
    chromeSettings: createDefaultSettings(),
    chromeInfo: {
      chrome_installed: true,
      edge_installed: false,
      extension_exists: false,
      extension_path: 'C:/tmp/BrowserBgSwap/Extension',
    },
    isLoading: false,
    error: null,
    updateSettings: vi.fn(),
    selectImage: vi.fn(),
    detectChrome,
    applyChrome: vi.fn(),
    removeChrome: vi.fn(),
    exportSettings: vi.fn(),
    importSettings: vi.fn(),
    resetSettings,
  }),
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    toasts: [],
    removeToast: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('../common/Toast', () => ({
  ToastContainer: () => null,
}));

vi.mock('./ChromeSettings', () => ({
  ChromeSettings: () => <div>ChromeSettings</div>,
}));

vi.mock('./NtpPreview', () => ({
  NtpPreview: () => <div>NtpPreview</div>,
}));

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('ChromePanel', () => {
  it('uses the custom confirm dialog instead of window.confirm for reset', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <I18nContext.Provider value={{ lang: 'en', setLang: () => {}, t: createT('en') }}>
        <ChromePanel />
      </I18nContext.Provider>
    );

    fireEvent.click(screen.getByText('Reset'));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Reset Chrome settings')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reset settings'));
    await waitFor(() => expect(resetSettings).toHaveBeenCalled());

    confirmSpy.mockRestore();
  });
});
