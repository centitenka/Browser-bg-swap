import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useT } from '../../i18n';
import type { ChromeDetectResult } from '../../types';

interface ChromeSetupGuideProps {
  chromeInfo: ChromeDetectResult;
  copied: string | null;
  onCopy: (text: string, label: string) => Promise<void>;
}

export function ChromeSetupGuide({
  chromeInfo,
  copied,
  onCopy,
}: ChromeSetupGuideProps) {
  const t = useT();

  return (
    <section className="rounded-2xl border border-border-subtle/50 bg-card/80 p-6 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500">{t('setup.installStatus')}</p>
          <h3 className="mt-2 text-lg font-semibold text-gray-50">{t('setup.chromeSetup')}</h3>
        </div>
        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100">
          {t('setup.manualStep')}
        </span>
      </div>

      <div className="mt-5 space-y-4 text-sm text-gray-300">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">1</span>
          <div className="space-y-2">
            <p>{t('setup.step1Detail')}</p>
            <div className="flex flex-wrap gap-2">
              {chromeInfo.chrome_installed && (
                <button
                  onClick={() => onCopy('chrome://extensions', 'Chrome URL')}
                  className="inline-flex items-center gap-2 rounded-full border border-border-subtle/50 bg-white/5 px-3 py-1.5 text-xs text-blue-200 hover:bg-white/10"
                >
                  chrome://extensions
                  {copied === 'Chrome URL' ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                </button>
              )}
              {chromeInfo.edge_installed && (
                <button
                  onClick={() => onCopy('edge://extensions', 'Edge URL')}
                  className="inline-flex items-center gap-2 rounded-full border border-border-subtle/50 bg-white/5 px-3 py-1.5 text-xs text-cyan-200 hover:bg-white/10"
                >
                  edge://extensions
                  {copied === 'Edge URL' ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">2</span>
          <div className="min-w-0 space-y-2">
            <p>{t('setup.step2Detail')}</p>
            <div className="flex flex-col gap-2 rounded-xl border border-border-subtle/50 bg-sidebar/70 px-3 py-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 truncate text-[11px] text-gray-300">{chromeInfo.extension_path}</code>
              <button
                onClick={() => onCopy(chromeInfo.extension_path, 'Path')}
                className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg bg-primary/10 px-2 py-1 text-xs text-primary hover:bg-primary/20"
              >
                {copied === 'Path' ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {t('setup.copyPath')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-[11px] font-semibold text-white">3</span>
          <div>
            <p>{t('setup.step3Detail')}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-gray-400">
              {t('setup.step3Footnote')}
              <ExternalLink size={12} />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
