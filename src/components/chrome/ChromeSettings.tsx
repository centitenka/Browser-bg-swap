import { useState } from 'react';
import type { BrowserSettings } from '../../types';
import { PresetsSection } from './settings/PresetsSection';
import { BackgroundSection } from './settings/BackgroundSection';
import { ClockSection } from './settings/ClockSection';
import { SearchSection } from './settings/SearchSection';
import { ShortcutsSection } from './settings/ShortcutsSection';
import { CustomCssSection } from './settings/CustomCssSection';

interface ChromeSettingsProps {
  settings: BrowserSettings;
  onChange: (settings: Partial<BrowserSettings>) => void;
  onSelectImage: () => void;
}

export function ChromeSettings({ settings, onChange, onSelectImage }: ChromeSettingsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return (
    <div className="space-y-6">
      <PresetsSection onChange={onChange} />
      <BackgroundSection
        settings={settings}
        expanded={!!expandedSections.background}
        onToggle={toggleSection}
        onChange={onChange}
        onSelectImage={onSelectImage}
      />
      <ClockSection
        settings={settings}
        expanded={!!expandedSections.clock}
        onToggle={toggleSection}
        onChange={onChange}
      />
      <SearchSection
        settings={settings}
        expanded={!!expandedSections.search}
        onToggle={toggleSection}
        onChange={onChange}
      />
      <ShortcutsSection
        settings={settings}
        expanded={!!expandedSections.shortcuts}
        onToggle={toggleSection}
        onChange={onChange}
      />
      <CustomCssSection settings={settings} onChange={onChange} />
    </div>
  );
}
