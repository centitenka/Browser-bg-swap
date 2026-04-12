import { AlertCircle, CheckCircle2, LoaderCircle, Sparkles } from 'lucide-react';
import type { ActionState } from '../../types';

interface ActionStatusCardProps {
  title: string;
  subtitle: string;
  dirty: boolean;
  actionState: ActionState;
}

function getTone(status: ActionState['status']) {
  switch (status) {
    case 'pending':
      return {
        icon: LoaderCircle,
        iconClass: 'animate-spin text-blue-300',
        borderClass: 'border-blue-500/20',
        badgeClass: 'bg-blue-500/10 text-blue-200',
        label: 'Working',
      };
    case 'success':
      return {
        icon: CheckCircle2,
        iconClass: 'text-green-300',
        borderClass: 'border-green-500/20',
        badgeClass: 'bg-green-500/10 text-green-200',
        label: 'Up to date',
      };
    case 'error':
      return {
        icon: AlertCircle,
        iconClass: 'text-red-300',
        borderClass: 'border-red-500/20',
        badgeClass: 'bg-red-500/10 text-red-200',
        label: 'Needs attention',
      };
    default:
      return {
        icon: Sparkles,
        iconClass: 'text-amber-300',
        borderClass: 'border-border-subtle/40',
        badgeClass: 'bg-white/5 text-gray-300',
        label: 'Ready',
      };
  }
}

export function ActionStatusCard({
  title,
  subtitle,
  dirty,
  actionState,
}: ActionStatusCardProps) {
  const tone = getTone(actionState.status);
  const Icon = tone.icon;
  const description = dirty
    ? 'You have unapplied changes in this browser workspace.'
    : actionState.message || subtitle;

  return (
    <section className={`rounded-2xl border bg-card/80 p-5 shadow-lg ${tone.borderClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Workspace state</p>
          <h3 className="text-lg font-semibold text-gray-50">{title}</h3>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${tone.badgeClass}`}>
          <Icon size={14} className={tone.iconClass} />
          {dirty ? 'Pending changes' : tone.label}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-300">{description}</p>

      {actionState.warnings.length > 0 && (
        <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/8 p-3 text-sm text-yellow-100">
          {actionState.warnings.join(' ')}
        </div>
      )}
    </section>
  );
}
