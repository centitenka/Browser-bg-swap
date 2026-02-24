export interface BrowserSettings {
  background_image: string | null;
  show_search_box: boolean;
  show_shortcuts: boolean;
}

export interface FirefoxConfig {
  profile_path: string | null;
  enabled: boolean;
  settings: BrowserSettings;
}

export interface ChromeConfig {
  extension_output_path: string | null;
  enabled: boolean;
  settings: BrowserSettings;
}

export interface AppConfig {
  firefox: FirefoxConfig;
  chrome: ChromeConfig;
}

export type BrowserType = 'Firefox' | 'Chrome' | 'Edge';

export interface ProfileInfo {
  name: string;
  path: string;
  is_default: boolean;
}

export interface BrowserInfo {
  browser_type: BrowserType;
  installed: boolean;
  profile_paths: ProfileInfo[];
}

export interface PrereqCheck {
  toolkit_legacy_enabled: boolean;
  all_ok: boolean;
  instructions: string[];
}
