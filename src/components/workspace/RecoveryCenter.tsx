import { useState } from 'react';
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
import { EmptyState } from '../common/EmptyState';

export interface RecoveryEntry {
  id: string;
  label: string;
  detail: string;
  badge: string;
}

interface RecoveryCenterProps {
  title: string;
  subtitle: string;
  countLabel: string;
  emptyTitle: string;
  emptyDesc: string;
  createLabel?: string;
  createIconLabel?: string;
  showAllLabel: string;
  hideLabel: string;
  restoreLabel: string;
  deleteLabel?: string;
  entries: RecoveryEntry[];
  onCreate?: () => void | Promise<void>;
  onRestore: (entry: RecoveryEntry) => void | Promise<void>;
  onDelete?: (entry: RecoveryEntry) => void | Promise<void>;
}

export function RecoveryCenter({
  title,
  subtitle,
  countLabel,
  emptyTitle,
  emptyDesc,
  createLabel,
  createIconLabel,
  showAllLabel,
  hideLabel,
  restoreLabel,
  deleteLabel,
  entries,
  onCreate,
  onRestore,
  onDelete,
}: RecoveryCenterProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border-subtle/50 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
          <p className="mt-2 text-sm text-gray-300">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{countLabel}</span>
          {entries.length > 0 && (
            <button
              onClick={() => setExpanded((value) => !value)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/10 hover:text-primary-hover"
              aria-expanded={expanded}
            >
              {expanded ? hideLabel : showAllLabel}
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {onCreate && createLabel && (
        <button
          onClick={() => void onCreate()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border-subtle bg-sidebar px-4 py-3 text-gray-200 transition-all duration-200 hover:border-primary/50 hover:text-primary"
          aria-label={createIconLabel ?? createLabel}
        >
          <div className="rounded-md bg-white/5 p-1 transition-colors hover:bg-primary/20">
            <Plus size={16} />
          </div>
          <span className="text-sm font-medium">{createLabel}</span>
        </button>
      )}

      {expanded && entries.length > 0 && (
        <div className="mt-4 divide-y divide-border-subtle/30 border-t border-border-subtle/30">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group -mx-2 flex items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-white/5"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="rounded-full border border-border-subtle bg-sidebar p-1.5 text-gray-400">
                  <Clock size={14} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm text-gray-300">{entry.label}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-200">
                      <BadgeCheck size={10} />
                      {entry.badge}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-gray-500">{entry.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => void onRestore(entry)}
                  className="rounded p-1.5 text-gray-400 transition-colors hover:bg-primary/10 hover:text-primary"
                  title={restoreLabel}
                >
                  <RotateCcw size={14} />
                </button>
                {onDelete && deleteLabel && (
                  <button
                    onClick={() => void onDelete(entry)}
                    className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-400/10 hover:text-red-400"
                    title={deleteLabel}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && entries.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={<Archive size={24} />}
            title={emptyTitle}
            description={emptyDesc}
          />
        </div>
      )}
    </div>
  );
}
