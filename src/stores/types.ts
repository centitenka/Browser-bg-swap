import type { StateCreator } from 'zustand';
import type {
  ActionState,
  AppConfig,
  ApplyResult,
  BackupEntry,
  BrowserInfo,
  BrowserSettings,
  BrowserTab,
  ChromeBundleSnapshotEntry,
  ChromeDetectResult,
  ImageLibraryEntry,
  PreparedImageResult,
  PrereqCheck,
  SettingsExchangeFile,
  Shortcut,
  ValidationResult,
  VerificationResult,
} from '../types';

export interface UiSlice {
  isLoading: boolean;
  requestCount: number;
  dirtyByTab: Record<BrowserTab, boolean>;
  actionState: Record<BrowserTab, ActionState>;
  beginRequest: () => void;
  endRequest: () => void;
  setDirty: (tab: BrowserTab, dirty: boolean) => void;
  clearDirty: (tab: BrowserTab) => void;
  setActionState: (
    tab: BrowserTab,
    next: Partial<ActionState> & Pick<ActionState, 'status'>
  ) => void;
  resetActionState: (tab: BrowserTab) => void;
}

export interface PersistenceSlice {
  config: AppConfig;
  firefoxSettings: BrowserSettings;
  chromeSettings: BrowserSettings;
  activeTab: BrowserTab;
  selectedProfile: string;
  selectedProfileKey: string | null;
  loadConfig: () => Promise<void>;
  saveConfig: (tab?: BrowserTab) => Promise<void>;
  setActiveTab: (tab: BrowserTab) => void;
  updateSettings: (settings: Partial<BrowserSettings>) => void;
  replaceSettings: (tab: BrowserTab, settings: BrowserSettings) => void;
  selectProfile: (path: string) => void;
  resetSettings: () => void;
  markAppliedSnapshot: (tab: BrowserTab) => void;
  clearAppliedSnapshot: (tab: BrowserTab) => void;
  savePreset: (browser: BrowserTab, name: string, overwrite?: boolean) => Promise<void>;
  renamePreset: (index: number, name: string) => Promise<void>;
  deletePreset: (index: number) => Promise<void>;
  recordRecentImage: (path: string) => void;
  toggleFavoriteImage: (path: string) => Promise<boolean>;
}

export interface BrowserSlice {
  firefoxInfo: BrowserInfo | null;
  chromeInfo: ChromeDetectResult | null;
  prereqCheck: PrereqCheck | null;
  backups: BackupEntry[];
  chromeSnapshots: ChromeBundleSnapshotEntry[];
  managedImages: ImageLibraryEntry[];
  detectFirefox: () => Promise<void>;
  detectChrome: () => Promise<void>;
  validateFirefox: () => Promise<ValidationResult | null>;
  validateChrome: () => Promise<ValidationResult | null>;
  checkPrerequisites: () => Promise<void>;
  autoFixPrerequisites: () => Promise<void>;
  applyFirefox: () => Promise<ApplyResult>;
  removeFirefox: () => Promise<ApplyResult>;
  applyChrome: () => Promise<ApplyResult>;
  removeChrome: () => Promise<void>;
  createBackup: () => Promise<string>;
  restoreBackup: (name: string) => Promise<void>;
  loadBackups: () => Promise<void>;
  deleteBackup: (name: string) => Promise<void>;
  loadChromeSnapshots: () => Promise<void>;
  exportChromeSnapshot: () => Promise<ChromeBundleSnapshotEntry>;
  restoreChromeSnapshot: (snapshotId: string) => Promise<ApplyResult>;
  selectImage: (managed?: boolean) => Promise<PreparedImageResult | null>;
  prepareDroppedImage: (path: string, managed?: boolean) => Promise<PreparedImageResult>;
  loadManagedImages: () => Promise<void>;
  importBrowserShortcuts: (browser: 'chrome' | 'edge') => Promise<Shortcut[]>;
  exportSettings: () => Promise<void>;
  importSettings: () => Promise<void>;
  exportDiagnostics: (browser?: BrowserTab) => Promise<string | null>;
}

export type ConfigStoreState = UiSlice & PersistenceSlice & BrowserSlice;

export type StoreSlice<T> = StateCreator<ConfigStoreState, [], [], T>;

export function createIdleActionState(): ActionState {
  return {
    actionId: null,
    status: 'idle',
    message: null,
    warnings: [],
    blocking: [],
    targetSummary: [],
    verification: null,
    updatedAt: null,
  };
}

export function formatActionError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function resolveSettingsForTab(
  tab: BrowserTab,
  state: Pick<ConfigStoreState, 'firefoxSettings' | 'chromeSettings'>
): BrowserSettings {
  return tab === 'firefox' ? state.firefoxSettings : state.chromeSettings;
}

export function mergeValidationIntoActionState(
  validation: ValidationResult | null | undefined
): Pick<ActionState, 'blocking' | 'warnings' | 'targetSummary' | 'verification'> {
  return {
    blocking: validation?.blocking ?? [],
    warnings: validation?.warnings ?? [],
    targetSummary: validation?.target_summary ?? [],
    verification: null,
  };
}

export function mergeVerificationIntoActionState(
  verification: VerificationResult | null | undefined
): Pick<ActionState, 'verification'> {
  return {
    verification: verification ?? null,
  };
}

export function resolveImportPayload(
  payload: SettingsExchangeFile | null | undefined
): BrowserSettings | null {
  if (!payload) {
    return null;
  }

  return payload.settings;
}
