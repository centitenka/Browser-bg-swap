import { useState } from 'react';
import { Info, Package, CheckCircle, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useConfigStore } from '../../stores/configStore';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer } from '../common/Toast';
import { SettingsPanel } from '../common/SettingsPanel';
import { invoke } from '@tauri-apps/api/core';

const installSteps = [
  { step: 1, text: '打开 Chrome/Edge 浏览器' },
  { step: 2, text: '在地址栏输入 chrome://extensions/（Chrome）或 edge://extensions/（Edge）' },
  { step: 3, text: '开启右上角的"开发者模式"' },
  { step: 4, text: '点击"加载已解压的扩展程序"' },
  { step: 5, text: '选择生成的 BrowserBgSwap_Extension 文件夹' },
  { step: 6, text: '扩展安装完成，打开新标签页查看效果' },
];

export function ChromePanel() {
  const [outputPath, setOutputPath] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  const {
    currentSettings,
    updateSettings,
    selectImage,
    generateChromeExtension,
  } = useConfigStore();

  const handleGenerate = async () => {
    if (!outputPath) {
      try {
        const defaultPath = await invoke<string>('get_downloads_dir');
        setOutputPath(defaultPath);
      } catch (e) {
        showError('无法获取默认下载目录');
        return;
      }
    }

    setIsGenerating(true);
    try {
      await generateChromeExtension(outputPath || './');
      setGenerated(true);
      success('Chrome 扩展已生成！请按照安装说明进行安装。');
      setTimeout(() => setGenerated(false), 3000);
    } catch (e) {
      showError('生成扩展失败：' + (e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenFolder = async () => {
    if (!outputPath) {
      showError('请先生成扩展');
      return;
    }
    try {
      await invoke('open_folder', { path: outputPath });
    } catch (e) {
      showError('无法打开文件夹');
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6 max-w-2xl animate-fade-in">
        <SettingsPanel
          settings={currentSettings}
          onChange={updateSettings}
          onSelectImage={selectImage}
        />

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">输出设置</h3>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300" htmlFor="output-path">
              扩展输出路径
            </label>
            <div className="flex gap-3">
              <input
                id="output-path"
                type="text"
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                placeholder="留空使用默认下载路径"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <p className="text-sm text-gray-400">
              生成的扩展文件夹 BrowserBgSwap_Extension 将保存在此路径下
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between text-left group"
            aria-expanded={showGuide}
            aria-controls="install-guide"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center">
                <Info size={20} className="text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">安装说明</h3>
                <p className="text-sm text-gray-400">查看详细的扩展安装步骤</p>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-white transition-colors">
              {showGuide ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {showGuide && (
            <div
              id="install-guide"
              className="mt-4 pt-4 border-t border-gray-700 animate-fade-in"
            >
              <ol className="space-y-3" role="list">
                {installSteps.map(({ step, text }) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <span
                      className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium"
                      aria-hidden="true"
                    >
                      {step}
                    </span>
                    <span className="pt-0.5">{text}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-200">
                  <strong>注意：</strong> 如果背景图片未显示，请确保图片路径正确。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isGenerating ? '生成中' : generated ? '已生成' : '生成扩展'}
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" />
            ) : generated ? (
              <CheckCircle size={20} aria-hidden="true" />
            ) : (
              <Package size={20} aria-hidden="true" />
            )}
            <span>
              {isGenerating ? '生成中...' : generated ? '已生成' : '生成扩展'}
            </span>
          </button>

          <button
            onClick={handleOpenFolder}
            disabled={!outputPath || isGenerating}
            className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="打开输出文件夹"
          >
            <FolderOpen size={18} aria-hidden="true" />
            <span className="text-sm">打开文件夹</span>
          </button>
        </div>
      </div>
    </>
  );
}
