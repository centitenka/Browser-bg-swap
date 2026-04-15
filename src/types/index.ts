export type BrowserTab = 'firefox' | 'chrome';
export type BackgroundImageMode = 'managed' | 'direct';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface Shortcut {
  title: string;
  url: string;
  icon: string;
  position?: ElementPosition;
}

export interface BrowserSettings {
  background_image: string | null;
  background_image_mode: BackgroundImageMode;
  overlay_opacity: number;
  show_clock: boolean;
  clock_color: string;
  clock_size: number;
  show_search_box: boolean;
  search_engine: string;
  search_url_template: string;
  show_shortcuts: boolean;
  shortcuts: Shortcut[];
  clock_position: ElementPosition;
  search_position: ElementPosition;
  shortcuts_position: ElementPosition;
  background_color: string;
  background_fit: string;
  background_blur: number;
  background_brightness: number;
  clock_format_24h: boolean;
  clock_show_seconds: boolean;
  clock_show_date: boolean;
  clock_font_weight: string;
  search_bg_color: string;
  search_bg_opacity: number;
  search_border_radius: number;
  search_placeholder: string;
  search_border_width: number;
  search_border_color: string;
  search_border_style: string;
  search_shadow_color: string;
  search_shadow_blur: number;
  search_shadow_opacity: number;
  search_backdrop_blur: number;
  search_text_color: string;
  search_width: number;
  search_padding: number;
  shortcuts_bg_color: string;
  shortcuts_bg_opacity: number;
  shortcuts_border_radius: number;
  shortcuts_columns: string;
  shortcuts_gap: number;
  shortcuts_border_width: number;
  shortcuts_border_color: string;
  shortcuts_border_style: string;
  shortcuts_shadow_color: string;
  shortcuts_shadow_blur: number;
  shortcuts_shadow_opacity: number;
  shortcuts_backdrop_blur: number;
  shortcuts_title_color: string;
  shortcuts_icon_size: number;
  shortcuts_padding_x: number;
  shortcuts_padding_y: number;
  shortcuts_shape: string;
  clock_shadow_color: string;
  clock_shadow_blur: number;
  clock_shadow_opacity: number;
  clock_letter_spacing: number;
  clock_font_family: string;
  overlay_color: string;
  custom_css: string;
}

export interface NamedPreset {
  name: string;
  browser: BrowserTab;
  settings: BrowserSettings;
}

export interface AppliedSettingsSnapshot {
  settings: BrowserSettings;
  applied_at: string;
}

export interface FirefoxConfig {
  selected_profile_path: string | null;
  profile_settings_by_key: Record<string, BrowserSettings>;
  last_applied_by_profile_key: Record<string, AppliedSettingsSnapshot>;
}

export interface ChromeConfig {
  settings: BrowserSettings;
  last_applied: AppliedSettingsSnapshot | null;
}

export interface AppConfig {
  config_version: number;
  firefox: FirefoxConfig;
  chrome: ChromeConfig;
  custom_presets: NamedPreset[];
  recent_background_images: string[];
  favorite_background_images: string[];
}

export interface SettingsExchangeFile {
  version: number;
  browser?: BrowserTab | null;
  settings: BrowserSettings;
}

export type BrowserType = 'Firefox' | 'Chrome' | 'Edge';

export interface ProfileInfo {
  name: string;
  path: string;
  key: string;
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

export interface BackupEntry {
  name: string;
  label: string;
  is_auto: boolean;
  source: string;
  profile_key: string;
}

export interface ChromeDetectResult {
  chrome_installed: boolean;
  edge_installed: boolean;
  extension_exists: boolean;
  extension_path: string;
  bundle_status: 'missing' | 'ready' | 'invalid';
  bundle_status_message: string;
}

export interface ChromeBundleSnapshotEntry {
  id: string;
  label: string;
  path: string;
}

export interface PreparedImageResult {
  path: string;
  original_path: string;
  managed: boolean;
}

export interface ImageLibraryEntry {
  path: string;
  label: string;
  source: 'managed' | 'cropped';
  modified_at: string;
}

export interface AppWarning {
  code: string;
  message: string;
  details?: string[];
}

export interface VerificationResult {
  verified: boolean;
  generated_files: string[];
  next_action?: string | null;
}

export interface ValidationResult {
  can_apply: boolean;
  blocking: AppWarning[];
  warnings: AppWarning[];
  target_summary: string[];
}

export interface ApplyResult {
  success: boolean;
  output_path: string | null;
  backup_name: string | null;
  warnings: AppWarning[];
  verification: VerificationResult;
}

export interface DiagnosticsExportPayload {
  generated_at: string;
  browser: BrowserTab;
  config: AppConfig;
  current_settings: BrowserSettings;
  selected_profile: string | null;
  selected_profile_key: string | null;
  firefox_info: BrowserInfo | null;
  chrome_info: ChromeDetectResult | null;
  prereq_check: PrereqCheck | null;
  backups: BackupEntry[];
  chrome_snapshots: ChromeBundleSnapshotEntry[];
  action_state: ActionState;
  dirty: boolean;
}

export type OperationStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ActionState {
  actionId: string | null;
  status: OperationStatus;
  message: string | null;
  warnings: AppWarning[];
  blocking: AppWarning[];
  targetSummary: string[];
  verification: VerificationResult | null;
  updatedAt: number | null;
}
