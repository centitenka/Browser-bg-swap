import { useEffect, useState, useCallback } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Save,
  Trash2,
  Globe,
  ArrowRight,
  Copy,
  FolderOpen,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useConfigStore } from '../../stores/configStore';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer } from '../common/Toast';
import { NtpPreview } from './NtpPreview';
import { ChromeSettings } from './ChromeSettings';
import { useT } from '../../i18n';
import type { ElementPosition } from '../../types';

export function ChromePanel() {
  const t = useT();
  const [hasApplied, setHasApplied] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const { toasts, removeToast, success, error: showError } = useToast();

  const {
    chromeSettings,
    chromeInfo,
    isLoading,
    error,
    updateSettings,
    selectImage,
    detectChrome,
    applyChrome,
    removeChrome,
    exportSettings,
    importSettings,
    resetSettings,
  } = useConfigStore();

  useEffect(() => {
    detectChrome();
  }, [detectChrome]);

  useEffect(() => {
    if (error) showError(error);
  }, [error, showError]);

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
      setHasApplied(true);
      success(
        chromeInfo?.extension_exists
          ? t('chrome.extUpdated')
          : t('chrome.extGenerated')
      );
      setTimeout(() => setHasApplied(false), 3000);
    } catch {
      showError(t('chrome.applyFailed'));
    }
  };

  const handleRemove = async () => {
    try {
      await removeChrome();
      success(t('chrome.removedOk'));
    } catch {
      showError(t('chrome.removeFailed'));
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
    success(t('chrome.resetOk'));
  };

  const handleOpenFolder = async () => {
    if (!chromeInfo?.extension_path) return;
    try {
      await invoke('open_folder', { path: chromeInfo.extension_path });
    } catch {
      showError(t('chrome.folderFailed'));
    }
  };

  const noBrowser =
    chromeInfo && !chromeInfo.chrome_installed && !chromeInfo.edge_installed;

  if (!chromeInfo) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner text={t('chrome.detecting')} />
        </div>
      </div>
    );
  }

  if (noBrowser) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-semibold text-yellow-100 mb-2">{t('chrome.noBrowser')}</h3>
            <p className="text-yellow-200/70 max-w-md mx-auto mb-6">
              {t('chrome.noBrowserDesc')}
            </p>
            <button
              onClick={detectChrome}
              className="px-6 py-2.5 bg-yellow-600/80 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </>
    );
  }

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
      <div className="flex flex-col xl:flex-row gap-6 max-w-6xl mx-auto animate-fade-in pb-12">
        {/* Left: Preview + Actions (sticky on wide screens) */}
        <div className="w-full xl:w-[58%] shrink-0 xl:sticky xl:top-0 xl:self-start space-y-4">
          {/* Browser badges */}
          <div className="flex items-center gap-3">
            {chromeInfo.chrome_installed && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-300">
                <Globe size={14} className="text-blue-400" />
                Chrome
              </div>
            )}
            {chromeInfo.edge_installed && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-gray-300">
                <Globe size={14} className="text-cyan-400" />
                Edge
              </div>
            )}
            {chromeInfo.extension_exists && (
              <span className="flex items-center gap-1 text-xs text-green-400 ml-auto">
                <CheckCircle size={12} />
                {t('chrome.deployed')}
              </span>
            )}
          </div>

          {/* Live preview */}
          <NtpPreview
            settings={chromeSettings}
            onPositionChange={handlePositionChange}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2 lg:gap-3 pt-4 border-t border-border-subtle/30">
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 lg:px-8 py-3 lg:py-3.5 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-primary/25 transition-all text-sm lg:text-base"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : hasApplied ? (
                <CheckCircle size={20} className="animate-scale-in" />
              ) : (
                <Save size={20} />
              )}
              <span>
                {isLoading
                  ? t('chrome.applying')
                  : hasApplied
                    ? t('common.done')
                    : chromeInfo.extension_exists
                      ? t('chrome.updateExt')
                      : t('chrome.generateExt')}
              </span>
            </button>

            {chromeInfo.extension_exists && (
              <>
                <button
                  onClick={handleOpenFolder}
                  className="p-3.5 bg-white/5 hover:bg-white/10 border border-border-subtle/50 text-gray-200 rounded-xl transition-colors"
                  title={t('chrome.openFolder')}
                >
                  <FolderOpen size={20} />
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="p-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-colors disabled:opacity-50"
                  title={t('chrome.remove')}
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>

          {/* Import / Export / Reset */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-border-subtle/50 text-gray-300 text-sm rounded-lg transition-colors"
              title={t('chrome.exportSettings')}
            >
              <Download size={16} />
              {t('common.export')}
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-border-subtle/50 text-gray-300 text-sm rounded-lg transition-colors"
              title={t('chrome.importSettings')}
            >
              <Upload size={16} />
              {t('common.import')}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
              title={t('chrome.resetDefaults')}
            >
              <RotateCcw size={16} />
              {t('common.reset')}
            </button>
          </div>
        </div>

        {/* Right: Settings (scrollable) */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Chrome-specific settings */}
          <ChromeSettings
            settings={chromeSettings}
            onChange={updateSettings}
            onSelectImage={selectImage}
          />

          {/* Setup guide (first time) */}
          {chromeInfo.extension_exists && (
            <div className="bg-card border border-border-subtle/50 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('setup.title')}
              </h3>

              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <div className="flex-1 space-y-1.5">
                  <p className="text-sm text-gray-200">{t('setup.step1')}</p>
                  <div className="flex flex-wrap gap-2">
                    {chromeInfo.chrome_installed && (
                      <button
                        onClick={() => handleCopy('chrome://extensions', 'Chrome URL')}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-sidebar/80 border border-border-subtle/30 rounded-lg hover:bg-sidebar transition-colors group"
                      >
                        <code className="text-xs text-blue-300">chrome://extensions</code>
                        {copied === 'Chrome URL' ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} className="text-gray-500 group-hover:text-gray-300" />}
                      </button>
                    )}
                    {chromeInfo.edge_installed && (
                      <button
                        onClick={() => handleCopy('edge://extensions', 'Edge URL')}
                        className="flex items-center gap-2 px-2.5 py-1.5 bg-sidebar/80 border border-border-subtle/30 rounded-lg hover:bg-sidebar transition-colors group"
                      >
                        <code className="text-xs text-cyan-300">edge://extensions</code>
                        {copied === 'Edge URL' ? <CheckCircle size={12} className="text-green-400" /> : <Copy size={12} className="text-gray-500 group-hover:text-gray-300" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
                <p className="text-sm text-gray-200" dangerouslySetInnerHTML={{ __html: t('setup.step2html') }} />
              </div>

              <div className="ml-9 flex items-center gap-2">
                <code className="flex-1 text-[11px] bg-sidebar/80 text-gray-300 px-3 py-1.5 rounded-lg border border-border-subtle/30 truncate">
                  {chromeInfo.extension_path}
                </code>
                <button
                  onClick={() => handleCopy(chromeInfo.extension_path, 'Path')}
                  className="shrink-0 px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs rounded-lg transition-colors"
                >
                  {copied === 'Path' ? <CheckCircle size={12} /> : <Copy size={12} />}
                </button>
              </div>

              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center font-bold">&#10003;</span>
                <p className="text-sm text-gray-200">{t('setup.done')}</p>
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3">
            <ArrowRight size={16} className="mt-0.5 text-blue-400 shrink-0" />
            <p className="text-sm text-blue-200/80">
              <span className="font-medium text-blue-200">{t('setup.tip')}</span> {t('setup.tipText')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
