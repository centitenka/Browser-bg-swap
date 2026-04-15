import { useEffect } from 'react';
import { AlertCircle, FileSearch, FolderOpen, RefreshCcw, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { browserCapabilities } from '../../config/capabilities';
import { useT } from '../../i18n';
import { useConfigStore } from '../../stores/configStore';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer } from '../common/Toast';
import { NtpPreview } from '../chrome/NtpPreview';
import { ActionBar } from '../workspace/ActionBar';
import { ActionStatusCard } from '../workspace/ActionStatusCard';
import { BrowserWorkspace } from '../workspace/BrowserWorkspace';
import { RecoveryCenter } from '../workspace/RecoveryCenter';
import { SettingsPanel } from '../common/SettingsPanel';
import { ProfileSelector } from './ProfileSelector';
import { PresetsSection } from '../chrome/settings/PresetsSection';

export function FirefoxPanel() {
  const t = useT();
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const { toasts, removeToast, success, error: showError } = useToast();

  const {
    config,
    firefoxInfo,
    selectedProfile,
    selectedProfileKey,
    firefoxSettings,
    prereqCheck,
    isLoading,
    dirtyByTab,
    actionState,
    detectFirefox,
    selectProfile,
    updateSettings,
    validateFirefox,
    checkPrerequisites,
    applyFirefox,
    removeFirefox,
    autoFixPrerequisites,
    selectImage,
    resetSettings,
    backups,
    loadBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    exportDiagnostics,
  } = useConfigStore();

  const firefoxAction = actionState.firefox;
  const isDirty = dirtyByTab.firefox;
  const lastAppliedAt =
    selectedProfileKey
      ? config.firefox.last_applied_by_profile_key[selectedProfileKey]?.applied_at ?? null
      : null;

  useEffect(() => {
    detectFirefox();
  }, [detectFirefox]);

  useEffect(() => {
    if (selectedProfile) {
      checkPrerequisites();
      loadBackups();
    }
  }, [selectedProfile, checkPrerequisites, loadBackups]);

  useEffect(() => {
    if (!selectedProfile) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void validateFirefox();
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [selectedProfile, firefoxSettings, validateFirefox]);

  const handleApply = async () => {
    try {
      await applyFirefox();
    } catch {
      // Action state already carries the error.
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

  const handleReset = async () => {
    const confirmed = await confirm({
      title: t('firefox.resetTitle'),
      message: t('firefox.resetMessage'),
      confirmText: t('common.reset'),
      cancelText: t('common.cancel'),
      isDangerous: true,
    });

    if (!confirmed) {
      return;
    }

    resetSettings();
  };

  const handleRemove = async () => {
    const confirmed = await confirm({
      title: t('firefox.removeTitle'),
      message: t('firefox.removeMessage'),
      confirmText: t('firefox.removeAction'),
      cancelText: t('common.cancel'),
      isDangerous: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await removeFirefox();
    } catch {
      // Action state already carries the error.
    }
  };

  const handleCreateBackup = async () => {
    try {
      await createBackup();
      success(t('backup.createdOk'));
    } catch (error) {
      showError(`${t('backup.createFailed')}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleExportDiagnostics = async () => {
    try {
      await exportDiagnostics('firefox');
      success(t('diagnostics.exported'));
    } catch {
      showError(t('diagnostics.exportFailed'));
    }
  };

  const handleRestoreBackup = async (backupName: string, label: string) => {
    const confirmed = await confirm({
      title: t('backup.restoreTitle'),
      message: t('backup.restoreMessage', { name: label }),
      confirmText: t('backup.restoreConfirm'),
      cancelText: t('common.cancel'),
      isDangerous: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await restoreBackup(backupName);
      success(t('backup.restoredOk'));
    } catch (error) {
      showError(`${t('backup.restoreFailed')}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDeleteBackup = async (backupName: string, label: string) => {
    const confirmed = await confirm({
      title: t('backup.deleteTitle'),
      message: t('backup.deleteMessage', { name: label }),
      confirmText: t('backup.deleteConfirm'),
      cancelText: t('common.cancel'),
      isDangerous: true,
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteBackup(backupName);
      success(t('backup.deletedOk'));
    } catch (error) {
      showError(`${t('backup.deleteFailed')}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (!firefoxInfo) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner text={t('firefox.detecting')} />
      </div>
    );
  }

  if (!firefoxInfo.installed) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
              <AlertCircle size={32} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-yellow-100">{t('firefox.noBrowser')}</h3>
            <p className="mx-auto mb-6 max-w-md text-yellow-200/70">{t('firefox.noBrowserDesc')}</p>
            <button
              onClick={detectFirefox}
              className="rounded-xl bg-yellow-600/80 px-6 py-2.5 font-medium text-white transition-colors hover:bg-yellow-600"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </>
    );
  }

  const prereqReady = !!prereqCheck?.all_ok;
  const hasBlocking = firefoxAction.blocking.length > 0;
  const sidebar = (
    <>
      <ActionStatusCard
        title={t('firefox.workspaceTitle')}
        subtitle={t('firefox.workspaceSubtitle')}
        dirty={isDirty}
        actionState={firefoxAction}
      />

      <section className="rounded-2xl border border-border-subtle/50 bg-card/80 p-5 shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{t('firefox.browserStatus')}</p>
        <div className="mt-4 space-y-4 text-sm text-gray-300">
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">{t('firefox.detectedProfiles')}</span>
            <span>{firefoxInfo.profile_paths.length}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-gray-500">{t('firefox.selectedProfile')}</span>
            <span className="max-w-[220px] break-all text-right text-xs text-gray-400">
              {selectedProfile || t('firefox.noneSelected')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">{t('firefox.prerequisite')}</span>
            <span className={prereqReady ? 'text-green-300' : 'text-yellow-200'}>
              {prereqReady ? t('firefox.prereqReady') : t('firefox.prereqNeedsSetup')}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">{t('status.lastApplied')}</span>
            <span className="text-right text-xs text-gray-400">
              {lastAppliedAt ? new Date(lastAppliedAt).toLocaleString() : t('status.notApplied')}
            </span>
          </div>
        </div>
      </section>

      <NtpPreview
        settings={firefoxSettings}
        onPositionChange={() => {
          // Firefox positioning is now handled through generated CSS.
        }}
        capabilities={browserCapabilities.firefox}
        modeLabel={t('firefox.previewTitle')}
        statusLabel={
          isDirty
            ? t('firefox.previewDirty')
            : t('firefox.previewSynced')
        }
      />
    </>
  );

  const content = (
    <>
      <ProfileSelector
        profiles={firefoxInfo.profile_paths}
        selected={selectedProfile}
        onSelect={selectProfile}
      />

      <section
        className={`rounded-2xl border p-6 shadow-lg ${
          prereqReady
            ? 'border-green-500/20 bg-green-500/8'
            : 'border-yellow-500/20 bg-yellow-500/10'
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`mt-1 flex h-10 w-10 items-center justify-center rounded-2xl ${
                prereqReady ? 'bg-green-500/15 text-green-200' : 'bg-yellow-500/15 text-yellow-200'
              }`}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{t('firefox.prereqFlow')}</p>
              <h3 className="mt-2 text-lg font-semibold text-gray-50">
                {prereqReady ? t('firefox.readyForCss') : t('firefox.configRequired')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                {prereqReady
                  ? t('firefox.readyForCssDesc')
                  : t('firefox.configRequiredDesc')}
              </p>
            </div>
          </div>
          {!prereqReady && (
            <button
              onClick={autoFixPrerequisites}
              disabled={isLoading}
              className="w-full shrink-0 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-500 disabled:opacity-50 sm:w-auto"
            >
              {t('firefox.autoConfigure')}
            </button>
          )}
        </div>

        {prereqCheck && prereqCheck.instructions.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-gray-200">
            {prereqCheck.instructions.map((instruction, index) => (
              <li key={`${instruction}-${index}`} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          {t('firefox.restartTipTitle')} {t('firefox.restartTipText')}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-5 text-sm text-blue-100 shadow-lg">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-200/80">{t('firefox.supportedTitle')}</p>
        <p className="mt-3 leading-6">{t('firefox.supportedDesc')}</p>
      </section>

      <PresetsSection browser="firefox" onChange={updateSettings} />

      <SettingsPanel
        settings={firefoxSettings}
        onChange={updateSettings}
        onSelectImage={() => void selectImage(firefoxSettings.background_image_mode !== 'direct')}
        capabilities={browserCapabilities.firefox}
      />

      {selectedProfile && (
        <RecoveryCenter
          title={t('recovery.title')}
          subtitle={t('recovery.firefoxDesc')}
          countLabel={
            backups.length > 0
              ? t('backup.savedCount', { count: String(backups.length) })
              : t('backup.none')
          }
          emptyTitle={t('backup.emptyTitle')}
          emptyDesc={t('backup.emptyDesc')}
          createLabel={t('backup.create')}
          createIconLabel={t('backup.create')}
          showAllLabel={t('common.showAll')}
          hideLabel={t('common.hide')}
          restoreLabel={t('backup.restoreConfirm')}
          deleteLabel={t('backup.deleteConfirm')}
          entries={backups.map((backup) => ({
            id: backup.name,
            label: backup.label,
            detail: backup.name,
            badge: backup.source,
          }))}
          onCreate={handleCreateBackup}
          onRestore={(entry) => handleRestoreBackup(entry.id, entry.label)}
          onDelete={(entry) => handleDeleteBackup(entry.id, entry.label)}
        />
      )}
    </>
  );

  const actionBar = (
    <ActionBar
      summary={
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{t('firefox.actionsTitle')}</p>
          <p className="mt-1 text-sm text-gray-300">
            {isDirty
              ? t('firefox.actionsDirty')
              : t('firefox.actionsSynced')}
          </p>
        </div>
      }
      actions={
        <>
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
            onClick={handleOpenProfile}
            disabled={!selectedProfile}
            className="rounded-xl border border-border-subtle/50 bg-white/5 px-4 py-2.5 text-sm text-gray-200 transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <FolderOpen size={15} />
              {t('firefox.openProfile')}
            </span>
          </button>
          <button
            onClick={handleRemove}
            disabled={!selectedProfile || isLoading}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 transition-colors hover:bg-red-500/20 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <Trash2 size={15} />
              {t('firefox.removeAction')}
            </span>
          </button>
          <button
            onClick={handleApply}
            disabled={isLoading || !prereqReady || hasBlocking}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <Save size={15} />
              {isLoading ? t('firefox.applying') : t('firefox.saveAndApply')}
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
