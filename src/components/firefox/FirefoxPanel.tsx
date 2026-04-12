import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle, FolderOpen, Save } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { browserCapabilities } from '../../config/capabilities';
import { useT } from '../../i18n';
import { useConfigStore } from '../../stores/configStore';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer } from '../common/Toast';
import { SettingsPanel } from '../common/SettingsPanel';
import { BackupManager } from './BackupManager';
import { ProfileSelector } from './ProfileSelector';

export function FirefoxPanel() {
  const [hasApplied, setHasApplied] = useState(false);
  const t = useT();
  const { toasts, removeToast, success, error: showError } = useToast();

  const {
    firefoxInfo,
    selectedProfile,
    firefoxSettings,
    prereqCheck,
    isLoading,
    error,
    detectFirefox,
    selectProfile,
    updateSettings,
    checkPrerequisites,
    applyFirefox,
    autoFixPrerequisites,
    selectImage,
  } = useConfigStore();

  useEffect(() => {
    detectFirefox();
  }, [detectFirefox]);

  useEffect(() => {
    if (selectedProfile) {
      checkPrerequisites();
    }
  }, [selectedProfile, checkPrerequisites]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const handleApply = async () => {
    try {
      await applyFirefox();
      setHasApplied(true);
      success(t('firefox.appliedOk'));
      setTimeout(() => setHasApplied(false), 3000);
    } catch {
      showError(t('firefox.applyFailed'));
    }
  };

  const handleOpenProfile = async () => {
    if (!selectedProfile) {
      return;
    }

    try {
      await invoke('open_folder', { path: selectedProfile });
    } catch {
      showError(t('firefox.openProfileFailed'));
    }
  };

  if (!firefoxInfo) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner text={t('firefox.detecting')} />
        </div>
        <div className="space-y-6 opacity-50">
          <div className="h-32 bg-white/5 rounded-xl w-full animate-pulse" />
          <div className="h-48 bg-white/5 rounded-xl w-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (!firefoxInfo.installed) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-semibold text-yellow-100 mb-2">{t('firefox.noBrowser')}</h3>
            <p className="text-yellow-200/70 max-w-md mx-auto mb-6">
              {t('firefox.noBrowserDesc')}
            </p>
            <button
              onClick={detectFirefox}
              className="px-6 py-2.5 bg-yellow-600/80 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-8 max-w-3xl mx-auto animate-fade-in pb-12">
        {prereqCheck && !prereqCheck.all_ok && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-yellow-100 font-medium text-base mb-1">{t('firefox.configRequired')}</h4>
                <p className="text-yellow-200/70 text-sm mb-3">{t('firefox.configRequiredDesc')}</p>
                <ul className="space-y-1.5 text-sm text-yellow-200/80 mb-4" role="list">
                  {prereqCheck.instructions.map((instruction, index) => (
                    <li key={`${instruction}-${index}`} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-yellow-500" aria-hidden="true" />
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={autoFixPrerequisites}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-600/90 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/50 disabled:opacity-50"
                >
                  {t('firefox.autoConfigure')}
                </button>
              </div>
            </div>
          </div>
        )}

        <ProfileSelector
          profiles={firefoxInfo.profile_paths}
          selected={selectedProfile}
          onSelect={selectProfile}
        />

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-200 mb-2">{t('firefox.supportedTitle')}</h4>
          <p className="text-sm text-blue-200/80">{t('firefox.supportedDesc')}</p>
        </div>

        <SettingsPanel
          settings={firefoxSettings}
          onChange={updateSettings}
          onSelectImage={selectImage}
          capabilities={browserCapabilities.firefox}
        />

        {selectedProfile && <BackupManager />}

        <div className="flex items-center gap-4 pt-4 border-t border-border-subtle/30">
          <button
            onClick={handleApply}
            disabled={isLoading || !prereqCheck?.all_ok}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-primary/25 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                ? t('firefox.applying')
                : hasApplied
                  ? t('firefox.appliedAction')
                  : t('firefox.applyAction')}
            </span>
          </button>

          <button
            onClick={handleOpenProfile}
            disabled={!selectedProfile}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-border-subtle/50 text-gray-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-border-subtle"
            title={t('firefox.openProfile')}
          >
            <FolderOpen size={20} />
          </button>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3">
          <div className="mt-0.5 text-blue-400">
            <ArrowRight size={18} />
          </div>
          <p className="text-sm text-blue-200/80 leading-relaxed">
            <span className="font-medium text-blue-200">{t('firefox.restartTipTitle')}</span> {t('firefox.restartTipText')}
          </p>
        </div>
      </div>
    </>
  );
}
