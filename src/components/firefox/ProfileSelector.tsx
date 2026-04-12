import { Check, Folder, User } from 'lucide-react';
import { useT } from '../../i18n';
import type { ProfileInfo } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface ProfileSelectorProps {
  profiles: ProfileInfo[];
  selected: string;
  onSelect: (path: string) => void;
}

export function ProfileSelector({
  profiles,
  selected,
  onSelect,
}: ProfileSelectorProps) {
  const t = useT();

  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={<Folder size={32} />}
        title={t('profile.noneTitle')}
        description={t('profile.noneDesc')}
      />
    );
  }

  return (
    <div className="bg-card border border-border-subtle/50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('profile.title')}
        </h3>
        <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-white/5 rounded-full">
          {t('profile.available', { count: String(profiles.length) })}
        </span>
      </div>

      <div className="space-y-2" role="radiogroup" aria-label={t('profile.title')}>
        {profiles.map((profile) => {
          const isSelected = selected === profile.path;
          return (
            <label
              key={profile.path}
              className={`relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 group focus-within:ring-2 focus-within:ring-primary/50 ${
                isSelected
                  ? 'bg-primary/10 border border-primary/50 shadow-[0_0_0_1px_rgba(0,122,255,0.3)]'
                  : 'bg-sidebar/30 border border-border-subtle/30 hover:bg-sidebar hover:border-border-subtle'
              }`}
            >
              <input
                type="radio"
                name="profile"
                value={profile.path}
                checked={isSelected}
                onChange={() => onSelect(profile.path)}
                className="sr-only"
                aria-label={t('profile.selectAria', { name: profile.name })}
              />

              <div
                className={`shrink-0 mr-3 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300'
                }`}
              >
                {isSelected ? <Check size={14} /> : <User size={14} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium truncate transition-colors ${
                      isSelected ? 'text-primary' : 'text-gray-200'
                    }`}
                  >
                    {profile.name}
                  </span>
                  {profile.is_default && (
                    <span className="shrink-0 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wide rounded-md">
                      {t('profile.default')}
                    </span>
                  )}
                </div>
                <p
                  className="text-gray-500 text-xs mt-0.5 truncate font-mono"
                  title={profile.path}
                >
                  {profile.path}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
