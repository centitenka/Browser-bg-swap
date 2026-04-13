import type { BrowserTab } from '../types';

export interface BrowserCapabilities {
  supportsBackgroundImage: boolean;
  supportsBackgroundColor: boolean;
  supportsBackgroundFit: boolean;
  supportsBackgroundBlur: boolean;
  supportsBackgroundBrightness: boolean;
  supportsOverlayColor: boolean;
  supportsOverlayOpacity: boolean;
  supportsClock: boolean;
  supportsSearchVisibility: boolean;
  supportsSearchStyling: boolean;
  supportsSearchEngine: boolean;
  supportsSearchPositioning: boolean;
  supportsShortcutsVisibility: boolean;
  supportsShortcutsStyling: boolean;
  supportsShortcutsEditing: boolean;
  supportsShortcutsPositioning: boolean;
  supportsCustomCss: boolean;
  supportsPresets: boolean;
}

export const browserCapabilities: Record<BrowserTab, BrowserCapabilities> = {
  firefox: {
    supportsBackgroundImage: true,
    supportsBackgroundColor: true,
    supportsBackgroundFit: true,
    supportsBackgroundBlur: true,
    supportsBackgroundBrightness: true,
    supportsOverlayColor: true,
    supportsOverlayOpacity: true,
    supportsClock: false,
    supportsSearchVisibility: true,
    supportsSearchStyling: true,
    supportsSearchEngine: false,
    supportsSearchPositioning: false,
    supportsShortcutsVisibility: true,
    supportsShortcutsStyling: true,
    supportsShortcutsEditing: false,
    supportsShortcutsPositioning: false,
    supportsCustomCss: false,
    supportsPresets: false,
  },
  chrome: {
    supportsBackgroundImage: true,
    supportsBackgroundColor: true,
    supportsBackgroundFit: true,
    supportsBackgroundBlur: true,
    supportsBackgroundBrightness: true,
    supportsOverlayColor: true,
    supportsOverlayOpacity: true,
    supportsClock: true,
    supportsSearchVisibility: true,
    supportsSearchStyling: true,
    supportsSearchEngine: true,
    supportsSearchPositioning: true,
    supportsShortcutsVisibility: true,
    supportsShortcutsStyling: true,
    supportsShortcutsEditing: true,
    supportsShortcutsPositioning: true,
    supportsCustomCss: true,
    supportsPresets: true,
  },
};
