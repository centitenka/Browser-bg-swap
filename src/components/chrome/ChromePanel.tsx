import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, FileSearch, FolderOpen, Globe, RefreshCcw, Save, Trash2 } from 'lucide-react';
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
import { RecoveryCenter } from '../workspace/RecoveryCenter';
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
    config,
    chromeSettings,
    chromeInfo,
    isLoading,
    dirtyByTab,
    actionState,
    updateSettings,
    selectImage,
    detectChrome,
    validateChrome,
    applyChrome,
    removeChrome,
    chromeSnapshots,
    exportChromeSnapshot,
    restoreChromeSnapshot,
    exportSettings,
    importSettings,
    exportDiagnostics,
    resetSettings,
  } = useConfigStore();

  const chromeAction = actionState.chrome;
  const isDirty = dirtyByTab.chrome;
  const lastAppliedAt = config.chrome.last_applied?.applied_at ?? null;

  useEffect(() => {
    detectChrome();
  }, [detectChrome]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void validateChrome();
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [chromeSettings, validateChrome]);

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

  const handleExportDiagnostics = async () => {
    try {
      await exportDiagnostics('chrome');
      success(t('diagnostics.exported'));
    } catch {
      showError(t('diagnostics.exportFailed'));
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

  const handleExportSnapshot = async () => {
    try {
      const snapshot = await exportChromeSnapshot();
      success(t('chrome.snapshotExported', { name: snapshot.label }));
    } catch {
      showError(t('chrome.snapshotExportFailed'));
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    const snapshot = chromeSnapshots.find((entry) => entry.id === snapshotId);
    const confirmed = await confirm({
      title: t('chrome.snapshotRestoreTitle'),
      message: t('chrome.snapshotRestoreMessage', {
        name: snapshot?.label ?? snapshotId,
      }),
      confirmText: t('chrome.snapshotRestore'),
      cancelText: t('common.cancel'),
      isDangerous: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await restoreChromeSnapshot(snapshotId);
      success(t('chrome.snapshotRestored'));
    } catch {
      showError(t('chrome.snapshotRestoreFailed'));
    }
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

  const handleOpenExtensionsPage = async (browser: 'chrome' | 'edge') => {
    try {
      await invoke('open_extensions_page', { browser });
    } catch {
      showError(t('chrome.openExtensionsFailed'));
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
        title={t('chrome.workspaceTitle')}
        subtitle={t('chrome.workspaceSubtitle')}
        dirty={isDirty}
        actionState={chromeAction}
      />

      <section className="rounded-2xl border border-border-subtle/50 bg-card/80 p-5 shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{t('chrome.detectedBrowsers')}</p>
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
            <dt className="text-gray-500">{t('chrome.bundleStatus')}</dt>
            <dd>
              {chromeInfo.bundle_status === 'ready'
                ? t('chrome.bundleReady')
                : chromeInfo.bundle_status === 'invalid'
                  ? t('chrome.bundleInvalid')
                  : t('chrome.bundleMissing')}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-gray-500">{t('chrome.bundleFolder')}</dt>
            <dd className="max-w-[220px] break-all text-right text-xs text-gray-400">{chromeInfo.extension_path}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-500">{t('status.lastApplied')}</dt>
            <dd className="text-right text-xs text-gray-400">
              {lastAppliedAt ? new Date(lastAppliedAt).toLocaleString() : t('status.notApplied')}
            </dd>
          </div>
        </dl>
      </section>

      <NtpPreview
        settings={chromeSettings}
        onPositionChange={handlePositionChange}
        capabilities={browserCapabilities.chrome}
        modeLabel={t('chrome.livePreview')}
        statusLabel={isDirty ? t('chrome.previewDirty') : t('chrome.previewSynced')}
      />
    </>
  );

  const content = (
    <>
      <ChromeSettings
        settings={chromeSettings}
        onChange={updateSettings}
        onSelectImage={() => void selectImage(chromeSettings.background_image_mode !== 'direct')}
      />

      <ChromeSetupGuide
        chromeInfo={chromeInfo}
        copied={copied}
        onCopy={handleCopy}
      />

      <RecoveryCenter
        title={t('recovery.title')}
        subtitle={t('recovery.chromeDesc')}
        countLabel={
          chromeSnapshots.length > 0
            ? t('backup.savedCount', { count: String(chromeSnapshots.length) })
            : t('backup.none')
        }
        emptyTitle={t('chrome.snapshotEmptyTitle')}
        emptyDesc={t('chrome.snapshotEmptyDesc')}
        createLabel={t('chrome.snapshotExport')}
        createIconLabel={t('chrome.snapshotExport')}
        showAllLabel={t('common.showAll')}
        hideLabel={t('common.hide')}
        restoreLabel={t('chrome.snapshotRestore')}
        entries={chromeSnapshots.map((snapshot) => ({
          id: snapshot.id,
          label: snapshot.label,
          detail: snapshot.path,
          badge: t('chrome.snapshotBadge'),
        }))}
        onCreate={handleExportSnapshot}
        onRestore={(entry) => handleRestoreSnapshot(entry.id)}
      />
    </>
  );

  const actionBar = (
    <ActionBar
      summary={
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{t('chrome.actionsTitle')}</p>
          <p className="mt-1 text-sm text-gray-300">
            {isDirty
              ? t('chrome.actionsDirty')
              : t('chrome.actionsSynced')}
          </p>
        </div>
      }
      actions={
        <>
          {chromeInfo.chrome_installed && (
            <button
              onClick={() => handleOpenExtensionsPage('chrome')}
              className="rounded-xl border border-border-subtle/50 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10"
            >
              {t('chrome.openChromeExtensions')}
            </button>
          )}
          {chromeInfo.edge_installed && (
            <button
              onClick={() => handleOpenExtensionsPage('edge')}
              className="rounded-xl border border-border-subtle/50 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10"
            >
              {t('chrome.openEdgeExtensions')}
            </button>
          )}
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
            onClick={handleExportDiagnostics}
            className="rounded-xl border border-border-subtle/50 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10"
          >
            <span className="inline-flex items-center gap-2">
              <FileSearch size={15} />
              {t('diagnostics.export')}
            </span>
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
            disabled={isLoading || chromeAction.blocking.length > 0}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <Save size={15} />
              {isLoading ? t('chrome.applying') : t('chrome.saveAndApply')}
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
