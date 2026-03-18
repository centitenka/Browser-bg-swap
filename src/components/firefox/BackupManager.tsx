import { useEffect, useState } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
} from 'lucide-react';
import { useConfigStore } from '../../stores/configStore';
import { useConfirm } from '../../hooks/useConfirm';
import { useToast } from '../../hooks/useToast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

function formatBackupTime(filename: string): string {
  const match = filename.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  if (!match) return filename;

  const [, year, month, day, hour, minute] = match;
  return `${year}/${month}/${day} ${hour}:${minute}`;
}

export function BackupManager() {
  const [showBackups, setShowBackups] = useState(false);
  const { confirmState, confirm, onConfirm, onCancel } = useConfirm();
  const { success, error: showError } = useToast();

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
      success('Backup created successfully');
    } catch (e) {
      showError('Failed to create backup: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleRestore = async (name: string) => {
    const confirmed = await confirm({
      title: 'Restore Backup',
      message: `Are you sure you want to restore "${formatBackupTime(name)}"? This will overwrite your current settings.`,
      confirmText: 'Restore',
      cancelText: 'Cancel',
      isDangerous: true,
    });

    if (confirmed) {
      try {
        await restoreBackup(name);
        success('Backup restored successfully');
      } catch (e) {
        showError('Failed to restore backup: ' + (e instanceof Error ? e.message : String(e)));
      }
    }
  };

  const handleDelete = async (name: string) => {
    const confirmed = await confirm({
      title: 'Delete Backup',
      message: `Are you sure you want to delete "${formatBackupTime(name)}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
    });

    if (confirmed) {
      try {
        await deleteBackup?.(name);
        success('Backup deleted');
      } catch (e) {
        showError('Failed to delete: ' + (e instanceof Error ? e.message : String(e)));
      }
    }
  };

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

      <div className="bg-card border border-border-subtle/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Backups
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">
              {backups.length > 0 ? `${backups.length} saved` : 'No backups'}
            </span>
            {backups.length > 0 && (
              <button
                onClick={() => setShowBackups(!showBackups)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors px-2 py-1 rounded hover:bg-primary/10"
                aria-expanded={showBackups}
              >
                {showBackups ? 'Hide' : 'Show All'}
                {showBackups ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sidebar border border-border-subtle hover:border-primary/50 text-gray-200 hover:text-primary rounded-lg transition-all duration-200 group"
          aria-label="Create new backup"
        >
          <div className="p-1 rounded-md bg-white/5 group-hover:bg-primary/20 transition-colors">
             <Plus size={16} className="group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-medium">Create New Backup</span>
        </button>

        {showBackups && backups.length > 0 && (
          <div className="mt-4 border-t border-border-subtle/30 divide-y divide-border-subtle/30">
            {backups.map((backup) => (
              <div
                key={backup}
                className="flex items-center justify-between py-3 px-2 group hover:bg-white/5 rounded-lg -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-full bg-sidebar border border-border-subtle text-gray-400">
                    <Clock size={14} />
                  </div>
                  <span className="text-sm text-gray-300 font-mono truncate">
                    {formatBackupTime(backup)}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(backup)}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    title="Restore"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(backup)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    title="Delete"
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
              title="No Backups Yet"
              description="Create a backup to save your current configuration."
            />
          </div>
        )}
      </div>
    </>
  );
}
