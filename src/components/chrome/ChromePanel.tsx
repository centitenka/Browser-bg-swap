import { useState } from 'react';
import { Info, Package, CheckCircle, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useConfigStore } from '../../stores/configStore';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ToastContainer } from '../common/Toast';
import { SettingsPanel } from '../common/SettingsPanel';
import { invoke } from '@tauri-apps/api/core';

const installSteps = [
  { step: 1, text: 'Open Chrome or Edge Browser' },
  { step: 2, text: 'Go to chrome://extensions/ or edge://extensions/' },
  { step: 3, text: 'Enable "Developer mode" in the top right' },
  { step: 4, text: 'Click "Load unpacked"' },
  { step: 5, text: 'Select the generated "BrowserBgSwap_Extension" folder' },
  { step: 6, text: 'Done! Open a new tab to see your background' },
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
        showError('Could not get default downloads directory');
        return;
      }
    }

    setIsGenerating(true);
    try {
      await generateChromeExtension(outputPath || './');
      setGenerated(true);
      success('Chrome extension generated! Follow the guide to install.');
      setTimeout(() => setGenerated(false), 3000);
    } catch (e) {
      showError('Generation failed: ' + (e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenFolder = async () => {
    if (!outputPath) {
      showError('Please generate the extension first');
      return;
    }
    try {
      await invoke('open_folder', { path: outputPath });
    } catch (e) {
      showError('Could not open folder');
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-8 max-w-3xl mx-auto animate-fade-in pb-12">
        <SettingsPanel
          settings={currentSettings}
          onChange={updateSettings}
          onSelectImage={selectImage}
        />

        <div className="bg-card border border-border-subtle/50 rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Output Configuration
          </h3>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300" htmlFor="output-path">
              Extension Output Path
            </label>
            <div className="flex gap-3">
              <input
                id="output-path"
                type="text"
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                placeholder="Leave empty for Downloads folder"
                className="flex-1 px-4 py-3 bg-sidebar/50 border border-border-subtle/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm"
              />
            </div>
            <p className="text-xs text-gray-500">
              The extension folder "BrowserBgSwap_Extension" will be created here.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border-subtle/50 rounded-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between p-6 text-left group hover:bg-white/5 transition-colors"
            aria-expanded={showGuide}
            aria-controls="install-guide"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <Info size={20} />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-200 group-hover:text-white transition-colors">Installation Guide</h3>
                <p className="text-sm text-gray-500 mt-0.5">How to install the generated extension</p>
              </div>
            </div>
            <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
              {showGuide ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {showGuide && (
            <div
              id="install-guide"
              className="px-6 pb-8 pt-2 border-t border-border-subtle/30 animate-fade-in"
            >
              <ol className="space-y-4" role="list">
                {installSteps.map(({ step, text }) => (
                  <li
                    key={step}
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <span
                      className="shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shadow-sm"
                      aria-hidden="true"
                    >
                      {step}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                 <Info size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-200/90 leading-relaxed">
                  <strong>Note:</strong> If the background image doesn't appear immediately, please check if the image path is accessible or try re-generating with a different image.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-subtle/30">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-primary/25 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label={isGenerating ? 'Generating...' : generated ? 'Generated!' : 'Generate Extension'}
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" />
            ) : generated ? (
              <CheckCircle size={20} className="animate-scale-in" />
            ) : (
              <Package size={20} />
            )}
            <span>
              {isGenerating ? 'Generating...' : generated ? 'Generated Successfully' : 'Generate Extension'}
            </span>
          </button>

          <button
            onClick={handleOpenFolder}
            disabled={!outputPath || isGenerating}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-border-subtle/50 text-gray-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-border-subtle disabled:opacity-50 disabled:cursor-not-allowed"
            title="Open Output Folder"
          >
            <FolderOpen size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
