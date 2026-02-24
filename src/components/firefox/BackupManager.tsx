import { useEffect, useState } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
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
  return `${year}年${month}月${day}日 ${hour}:${minute}`;
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
  }, []);

  const handleCreateBackup = async () => {
    try {
      await createBackup();
      success('备份创建成功！');
    } catch (e) {
      showError('备份创建失败：' + (e as Error).message);
    }
  };

  const handleRestore = async (name: string) => {
    const confirmed = await confirm({
      title: '恢复备份',
      message: `确定要恢复备份 "${formatBackupTime(name)}" 吗？这将覆盖当前配置。`,
      confirmText: '恢复',
      cancelText: '取消',
      isDangerous: true,
    });

    if (confirmed) {
      try {
        await restoreBackup(name);
        success('备份恢复成功！');
      } catch (e) {
        showError('备份恢复失败：' + (e as Error).message);
      }
    }
  };

  const handleDelete = async (name: string) => {
    const confirmed = await confirm({
      title: '删除备份',
      message: `确定要删除备份 "${formatBackupTime(name)}" 吗？此操作不可撤销。`,
      confirmText: '删除',
      cancelText: '取消',
      isDangerous: true,
    });

    if (confirmed) {
      try {
        await deleteBackup?.(name);
        success('备份已删除');
      } catch (e) {
        showError('删除失败：' + (e as Error).message);
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

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white">备份管理</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {backups.length > 0
                ? `共有 ${backups.length} 个备份`
                : '备份可在需要时恢复配置'}
            </p>
          </div>
          {backups.length > 0 && (
            <button
              onClick={() => setShowBackups(!showBackups)}
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              aria-expanded={showBackups}
            >
              {showBackups ? '收起' : '查看全部'}
              {showBackups ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          )}
        </div>

        <button
          onClick={handleCreateBackup}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="创建新备份"
        >
          <Archive size={18} aria-hidden="true" />
          <span>创建备份</span>
        </button>

        {showBackups && backups.length > 0 && (
          <div className="mt-4 space-y-2" role="list" aria-label="备份列表">
            {backups.map((backup) => (
              <div
                key={backup}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg group hover:bg-gray-650 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Clock
                    size={16}
                    className="text-gray-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span
                    className="text-gray-200 text-sm truncate"
                    title={backup}
                  >
                    {formatBackupTime(backup)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleRestore(backup)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="恢复此备份"
                    aria-label={`恢复备份 ${formatBackupTime(backup)}`}
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(backup)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                    title="删除此备份"
                    aria-label={`删除备份 ${formatBackupTime(backup)}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showBackups && backups.length === 0 && (
          <div className="mt-4">
            <EmptyState
              icon={<Archive size={24} />}
              title="暂无备份"
              description="创建备份以保存当前配置，需要时可随时恢复。"
              action={{
                label: '立即创建',
                onClick: handleCreateBackup,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
