import { Folder, Check } from 'lucide-react';
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
  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={<Folder size={32} />}
        title="未找到 Firefox 配置文件"
        description="请确保 Firefox 已安装并至少创建了一个用户配置文件。"
      />
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">选择配置文件</h3>
        <span className="text-sm text-gray-400">
          共 {profiles.length} 个配置
        </span>
      </div>
      <div className="space-y-2" role="radiogroup" aria-label="Firefox 配置文件选择">
        {profiles.map((profile) => {
          const isSelected = selected === profile.path;
          return (
            <label
              key={profile.path}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 group focus-within:ring-2 focus-within:ring-blue-500 ${
                isSelected
                  ? 'bg-blue-600/30 border border-blue-500'
                  : 'bg-gray-700 hover:bg-gray-600 border border-transparent hover:border-gray-500'
              }`}
            >
              <div className="relative">
                <input
                  type="radio"
                  name="profile"
                  value={profile.path}
                  checked={isSelected}
                  onChange={() => onSelect(profile.path)}
                  className="sr-only"
                  aria-label={`选择配置文件 ${profile.name}`}
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-500 group-hover:border-gray-400'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium truncate">
                    {profile.name}
                  </span>
                  {profile.is_default && (
                    <span className="shrink-0 px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                      默认
                    </span>
                  )}
                </div>
                <p
                  className="text-gray-400 text-sm mt-1 truncate"
                  title={profile.path}
                >
                  {profile.path}
                </p>
              </div>
              {isSelected && (
                <div
                  className="ml-2 w-2 h-2 bg-blue-500 rounded-full"
                  aria-hidden="true"
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
