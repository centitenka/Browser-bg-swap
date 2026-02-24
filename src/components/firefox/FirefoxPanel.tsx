import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Save, FolderOpen } from 'lucide-react';
import { useConfigStore } from '../../stores/configStore';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer } from '../common/Toast';
import { SkeletonCard } from '../common/Skeleton';
import { SettingsPanel } from '../common/SettingsPanel';
import { BackupManager } from './BackupManager';
import { ProfileSelector } from './ProfileSelector';

export function FirefoxPanel() {
  const [hasApplied, setHasApplied] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  const {
    firefoxInfo,
    selectedProfile,
    currentSettings,
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
  }, []);

  useEffect(() => {
    if (selectedProfile) {
      checkPrerequisites();
    }
  }, [selectedProfile]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  const handleApply = async () => {
    try {
      await applyFirefox();
      setHasApplied(true);
      success('Firefox 背景设置已成功应用！重启浏览器后生效。');
      setTimeout(() => setHasApplied(false), 3000);
    } catch (e) {
      showError('应用设置失败，请重试');
    }
  };

  if (!firefoxInfo) {
    return (
      <div className="max-w-2xl">
        <LoadingSpinner text="正在检测 Firefox 安装..." />
        <div className="mt-8 space-y-4">
          <SkeletonCard rows={3} />
        </div>
      </div>
    );
  }

  if (!firefoxInfo.installed) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="bg-yellow-900/50 border border-yellow-700 rounded-xl p-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-yellow-900/50 flex items-center justify-center">
              <AlertCircle className="text-yellow-500" size={24} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-200 font-semibold text-lg">未检测到 Firefox 浏览器</h3>
              <p className="text-yellow-400 text-sm mt-2">
                请确保 Firefox 已正确安装在您的系统上。如果已安装但未检测到，请检查安装路径是否正确。
              </p>
              <button
                onClick={detectFirefox}
                className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                aria-label="重新检测 Firefox"
              >
                重新检测
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 max-w-2xl animate-fade-in">
        {prereqCheck && !prereqCheck.all_ok && (
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={20} aria-hidden="true" />
              <div className="flex-1">
                <h4 className="text-yellow-200 font-medium">需要配置 Firefox</h4>
                <ul className="mt-2 space-y-1 text-sm text-yellow-400" role="list">
                  {prereqCheck.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={autoFixPrerequisites}
                  disabled={isLoading}
                  className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:text-gray-400 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  自动配置
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

        <SettingsPanel
          settings={currentSettings}
          onChange={updateSettings}
          onSelectImage={selectImage}
        />

        {selectedProfile && <BackupManager />}

        <div className="flex gap-4">
          <button
            onClick={handleApply}
            disabled={isLoading || !prereqCheck?.all_ok}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isLoading ? '应用中' : hasApplied ? '已应用' : '应用设置'}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : hasApplied ? (
              <CheckCircle size={20} aria-hidden="true" />
            ) : (
              <Save size={20} aria-hidden="true" />
            )}
            <span>
              {isLoading ? '应用中...' : hasApplied ? '已应用' : '应用设置'}
            </span>
          </button>

          <button
            onClick={() => {}}
            disabled={!selectedProfile}
            className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="打开配置文件目录"
          >
            <FolderOpen size={18} aria-hidden="true" />
            <span className="text-sm">打开目录</span>
          </button>
        </div>

        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 text-sm text-blue-200">
          <p className="flex items-start gap-2">
            <span aria-hidden="true">💡</span>
            <span>应用设置后需要重启 Firefox 才能看到效果。</span>
          </p>
        </div>
      </div>
    </>
  );
}
