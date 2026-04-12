import { useEffect, useState } from 'react';
import {
  Archive,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useT } from '../../i18n';
import { useConfigStore } from '../../stores/configStore';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { ToastContainer } from '../common/Toast';

export function BackupManager() {
  const [showBackups, setShowBackups] = useState(false);
  const t = useT();
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const { toasts, removeToast, success, error: showError } = useToast();

  const {
    backups,
    createBackup,
    restoreBackup,
    loadBackups,
    deleteBackup,
  } = useConfigStore();

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const handleCreateBackup = async () => {
    try {
      await createBackup();
      success(t('backup.createdOk'));
    } catch (e) {
      showError(`${t('backup.createFailed')}: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleRestore = async (name: string, label: string) => {
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
      await restoreBackup(name);
      success(t('backup.restoredOk'));
    } catch (e) {
      showError(`${t('backup.restoreFailed')}: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleDelete = async (name: string, label: string) => {
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
      await deleteBackup(name);
      success(t('backup.deletedOk'));
    } catch (e) {
      showError(`${t('backup.deleteFailed')}: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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

      <div className="bg-card border border-border-subtle/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t('backup.title')}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              {backups.length > 0
                ? t('backup.savedCount', { count: String(backups.length) })
                : t('backup.none')}
            </span>
            {backups.length > 0 && (
              <button
                onClick={() => setShowBackups((value) => !value)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors px-2 py-1 rounded hover:bg-primary/10"
                aria-expanded={showBackups}
              >
                {showBackups ? t('common.hide') : t('common.showAll')}
                {showBackups ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sidebar border border-border-subtle hover:border-primary/50 text-gray-200 hover:text-primary rounded-lg transition-all duration-200 group"
          aria-label={t('backup.create')}
        >
          <div className="p-1 rounded-md bg-white/5 group-hover:bg-primary/20 transition-colors">
            <Plus size={16} className="group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-medium">{t('backup.create')}</span>
        </button>

        {showBackups && backups.length > 0 && (
          <div className="mt-4 border-t border-border-subtle/30 divide-y divide-border-subtle/30">
            {backups.map((backup) => (
              <div
                key={backup.name}
                className="flex items-center justify-between py-3 px-2 group hover:bg-white/5 rounded-lg -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-full bg-sidebar border border-border-subtle text-gray-400">
                    <Clock size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300 font-mono truncate">
                        {backup.label}
                      </span>
                      {backup.is_auto && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-200">
                          <BadgeCheck size={10} />
                          Auto
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{backup.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(backup.name, backup.label)}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    title={t('backup.restoreConfirm')}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(backup.name, backup.label)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    title={t('backup.deleteConfirm')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showBackups && backups.length === 0 && (
          <div className="mt-6">
            <EmptyState
              icon={<Archive size={24} />}
              title={t('backup.emptyTitle')}
              description={t('backup.emptyDesc')}
            />
          </div>
        )}
      </div>
    </>
  );
}
