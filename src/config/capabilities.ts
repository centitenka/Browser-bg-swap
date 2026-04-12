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
  supportsSearchCustomization: boolean;
  supportsShortcutsVisibility: boolean;
  supportsShortcutsCustomization: boolean;
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
    supportsSearchCustomization: false,
    supportsShortcutsVisibility: true,
    supportsShortcutsCustomization: false,
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
    supportsSearchCustomization: true,
    supportsShortcutsVisibility: true,
    supportsShortcutsCustomization: true,
    supportsCustomCss: true,
    supportsPresets: true,
  },
};
