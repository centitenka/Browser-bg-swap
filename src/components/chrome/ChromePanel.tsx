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
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer } from '../common/Toast';
import { NtpPreview } from './NtpPreview';
import { ChromeSettings } from './ChromeSettings';
import type { ElementPosition } from '../../types';

export function ChromePanel() {
  const [hasApplied, setHasApplied] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
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
          ? 'Extension updated! Open a new tab to see changes.'
          : 'Extension generated! Follow the steps below to load it.'
      );
      setTimeout(() => setHasApplied(false), 3000);
    } catch {
      showError('Failed to apply settings.');
    }
  };

  const handleRemove = async () => {
    try {
      await removeChrome();
      success('Extension files removed.');
    } catch {
      showError('Failed to remove.');
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      success(`${label} copied!`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      showError('Failed to copy');
    }
  };

  const handleExport = async () => {
    try {
      await exportSettings();
      success('Settings exported!');
    } catch {
      showError('Failed to export settings.');
    }
  };

  const handleImport = async () => {
    try {
      await importSettings();
      success('Settings imported!');
    } catch {
      showError('Failed to import settings.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      resetSettings();
      success('Settings reset to defaults.');
    }
  };

  const handleOpenFolder = async () => {
    if (!chromeInfo?.extension_path) return;
    try {
      await invoke('open_folder', { path: chromeInfo.extension_path });
    } catch {
      showError('Could not open folder');
    }
  };

  const noBrowser =
    chromeInfo && !chromeInfo.chrome_installed && !chromeInfo.edge_installed;

  if (!chromeInfo) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner text="Detecting browsers..." />
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
            <h3 className="text-xl font-semibold text-yellow-100 mb-2">No Browser Detected</h3>
            <p className="text-yellow-200/70 max-w-md mx-auto mb-6">
              Could not find Chrome or Edge on this system.
            </p>
            <button
              onClick={detectChrome}
              className="px-6 py-2.5 bg-yellow-600/80 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="flex gap-6 max-w-6xl mx-auto animate-fade-in pb-12">
        {/* Left: Preview + Actions (sticky) */}
        <div className="w-[60%] shrink-0 sticky top-0 self-start space-y-4">
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
                Deployed
              </span>
            )}
          </div>

          {/* Live preview */}
          <NtpPreview
            settings={chromeSettings}
            onPositionChange={handlePositionChange}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border-subtle/30">
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-primary/25 transition-all"
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
                  ? 'Applying...'
                  : hasApplied
                    ? 'Done!'
                    : chromeInfo.extension_exists
                      ? 'Update Extension'
                      : 'Generate Extension'}
              </span>
            </button>

            {chromeInfo.extension_exists && (
              <>
                <button
                  onClick={handleOpenFolder}
                  className="p-3.5 bg-white/5 hover:bg-white/10 border border-border-subtle/50 text-gray-200 rounded-xl transition-colors"
                  title="Open folder"
                >
                  <FolderOpen size={20} />
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isLoading}
                  className="p-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-colors disabled:opacity-50"
                  title="Remove"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>

          {/* Import / Export / Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-border-subtle/50 text-gray-300 text-sm rounded-lg transition-colors"
              title="Export settings"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-border-subtle/50 text-gray-300 text-sm rounded-lg transition-colors"
              title="Import settings"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm rounded-lg transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw size={16} />
              Reset
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
                First-time Setup
              </h3>

              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <div className="flex-1 space-y-1.5">
                  <p className="text-sm text-gray-200">Open extensions page in your browser:</p>
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
                <p className="text-sm text-gray-200">Enable <strong>Developer mode</strong>, click <strong>"Load unpacked"</strong>, select:</p>
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
                <p className="text-sm text-gray-200">Done! Open a new tab to see your background.</p>
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3">
            <ArrowRight size={16} className="mt-0.5 text-blue-400 shrink-0" />
            <p className="text-sm text-blue-200/80">
              <span className="font-medium text-blue-200">Tip:</span> After first-time setup, just
              click "Update Extension" and open a new tab — no need to reload the extension.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
