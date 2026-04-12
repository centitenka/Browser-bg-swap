import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, FolderOpen, Globe, RefreshCcw, Save, Trash2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { browserCapabilities } from '../../config/capabilities';
import { useConfigStore } from '../../stores/configStore';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer } from '../common/Toast';
import { ActionBar } from '../workspace/ActionBar';
import { ActionStatusCard } from '../workspace/ActionStatusCard';
import { BrowserWorkspace } from '../workspace/BrowserWorkspace';
import { ChromeSetupGuide } from './ChromeSetupGuide';
import { NtpPreview } from './NtpPreview';
import { ChromeSettings } from './ChromeSettings';
import { useT } from '../../i18n';
import type { ElementPosition } from '../../types';

export function ChromePanel() {
  const t = useT();
  const [copied, setCopied] = useState<string | null>(null);
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const { toasts, removeToast, success, error: showError } = useToast();

  const {
    chromeSettings,
    chromeInfo,
    isLoading,
    dirtyByTab,
    actionState,
    updateSettings,
    selectImage,
    detectChrome,
    applyChrome,
    removeChrome,
    exportSettings,
    importSettings,
    resetSettings,
  } = useConfigStore();

  const chromeAction = actionState.chrome;
  const isDirty = dirtyByTab.chrome;

  useEffect(() => {
    detectChrome();
  }, [detectChrome]);

  const handlePositionChange = useCallback(
    (key: string, pos: ElementPosition) => {
      const shortcutMatch = key.match(/^shortcut_position_(\d+)$/);
      if (shortcutMatch) {
        const index = parseInt(shortcutMatch[1], 10);
        const shortcuts = [...chromeSettings.shortcuts];
        if (shortcuts[index]) {
          shortcuts[index] = { ...shortcuts[index], position: pos };
          updateSettings({ shortcuts });
        }
      } else {
        updateSettings({ [key]: pos });
      }
    },
    [updateSettings, chromeSettings.shortcuts]
  );

  const handleApply = async () => {
    try {
      await applyChrome();
    } catch {
      // Action state already captures the error.
    }
  };

  const handleRemove = async () => {
    try {
      await removeChrome();
    } catch {
      // Action state already captures the error.
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      success(t('common.copied', { label }));
      setTimeout(() => setCopied(null), 2000);
    } catch {
      showError(t('chrome.copyFailed'));
    }
  };

  const handleExport = async () => {
    try {
      await exportSettings();
      success(t('chrome.exportedOk'));
    } catch {
      showError(t('chrome.exportFailed'));
    }
  };

  const handleImport = async () => {
    try {
      await importSettings();
      success(t('chrome.importedOk'));
    } catch {
      showError(t('chrome.importFailed'));
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: t('chrome.resetTitle'),
      message: t('chrome.resetConfirm'),
      confirmText: t('chrome.resetConfirmAction'),
      cancelText: t('common.cancel'),
      isDangerous: true,
    });

    if (!confirmed) {
      return;
    }

    resetSettings();
  };

  const handleOpenFolder = async () => {
    if (!chromeInfo?.extension_path) {
      return;
    }

    try {
      await invoke('open_folder', { path: chromeInfo.extension_path });
    } catch {
      showError(t('chrome.folderFailed'));
    }
  };

  if (!chromeInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner text={t('chrome.detecting')} />
      </div>
    );
  }

  const noBrowser = !chromeInfo.chrome_installed && !chromeInfo.edge_installed;

  if (noBrowser) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
              <AlertCircle size={32} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-yellow-100">{t('chrome.noBrowser')}</h3>
            <p className="mx-auto mb-6 max-w-md text-yellow-200/70">{t('chrome.noBrowserDesc')}</p>
            <button
              onClick={detectChrome}
              className="rounded-xl bg-yellow-600/80 px-6 py-2.5 font-medium text-white transition-colors hover:bg-yellow-600"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </>
    );
  }

  const sidebar = (
    <>
      <ActionStatusCard
        title="Chrome / Edge workspace"
        subtitle="Generate the local extension bundle, then load it manually in your browser."
        dirty={isDirty}
        actionState={chromeAction}
      />

      <section className="rounded-2xl border border-border-subtle/50 bg-card/80 p-5 shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Detected browsers</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {chromeInfo.chrome_installed && (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-sm text-blue-100">
              <Globe size={14} />
              Chrome
            </span>
          )}
          {chromeInfo.edge_installed && (
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-100">
              <Globe size={14} />
              Edge
            </span>
          )}
        </div>
        <dl className="mt-5 space-y-3 text-sm text-gray-300">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-500">Bundle status</dt>
            <dd>{chromeInfo.extension_exists ? 'Generated locally' : 'Not generated yet'}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-gray-500">Bundle folder</dt>
            <dd className="max-w-[220px] text-right text-xs text-gray-400">{chromeInfo.extension_path}</dd>
          </div>
        </dl>
      </section>

      <NtpPreview
        settings={chromeSettings}
        onPositionChange={handlePositionChange}
        capabilities={browserCapabilities.chrome}
        modeLabel="Live preview"
        statusLabel={isDirty ? 'Preview differs from the installed bundle.' : 'Preview matches the saved settings.'}
      />
    </>
  );

  const content = (
    <>
      <ChromeSettings
        settings={chromeSettings}
        onChange={updateSettings}
        onSelectImage={selectImage}
      />

      <ChromeSetupGuide
        chromeInfo={chromeInfo}
        copied={copied}
        onCopy={handleCopy}
      />
    </>
  );

  const actionBar = (
    <ActionBar
      summary={
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Chrome / Edge actions</p>
          <p className="mt-1 text-sm text-gray-300">
            {isDirty
              ? 'Review the preview, then save and apply to refresh the local extension bundle.'
              : 'The local bundle is ready. Reload it in your browser if the page still shows an older version.'}
          </p>
        </div>
      }
      actions={
        <>
          <button
            onClick={handleExport}
            className="rounded-xl border border-border-subtle/50 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10"
          >
            {t('common.export')}
          </button>
          <button
            onClick={handleImport}
            className="rounded-xl border border-border-subtle/50 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10"
          >
            {t('common.import')}
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 transition-colors hover:bg-red-500/20"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCcw size={15} />
              {t('common.reset')}
            </span>
          </button>
          <button
            onClick={handleOpenFolder}
            className="rounded-xl border border-border-subtle/50 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10"
          >
            <span className="inline-flex items-center gap-2">
              <FolderOpen size={15} />
              {t('chrome.openFolder')}
            </span>
          </button>
          {chromeInfo.extension_exists && (
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <Trash2 size={15} />
                {t('chrome.remove')}
              </span>
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <Save size={15} />
              {isLoading ? t('chrome.applying') : 'Save and apply'}
            </span>
          </button>
        </>
      }
    />
  );

  return (
    <>
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        isDangerous={confirmState.isDangerous}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <BrowserWorkspace sidebar={sidebar} content={content} actionBar={actionBar} />
    </>
  );
}
