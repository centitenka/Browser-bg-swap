import type { StateCreator } from 'zustand';
import type {
  ActionState,
  AppConfig,
  ApplyResult,
  BackupEntry,
  BrowserInfo,
  BrowserSettings,
  BrowserTab,
  ChromeDetectResult,
  PrereqCheck,
  SettingsExchangeFile,
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
  loadConfig: () => Promise<void>;
  saveConfig: (tab?: BrowserTab) => Promise<void>;
  setActiveTab: (tab: BrowserTab) => void;
  updateSettings: (settings: Partial<BrowserSettings>) => void;
  replaceSettings: (tab: BrowserTab, settings: BrowserSettings, markDirty?: boolean) => void;
  selectProfile: (path: string, markDirty?: boolean) => void;
  resetSettings: () => void;
  savePreset: (name: string) => Promise<void>;
  deletePreset: (index: number) => Promise<void>;
}

export interface BrowserSlice {
  firefoxInfo: BrowserInfo | null;
  chromeInfo: ChromeDetectResult | null;
  prereqCheck: PrereqCheck | null;
  backups: BackupEntry[];
  detectFirefox: () => Promise<void>;
  detectChrome: () => Promise<void>;
  checkPrerequisites: () => Promise<void>;
  autoFixPrerequisites: () => Promise<void>;
  applyFirefox: () => Promise<ApplyResult>;
  applyChrome: () => Promise<ApplyResult>;
  removeChrome: () => Promise<void>;
  createBackup: () => Promise<string>;
  restoreBackup: (name: string) => Promise<void>;
  loadBackups: () => Promise<void>;
  deleteBackup: (name: string) => Promise<void>;
  selectImage: () => Promise<string | null>;
  exportSettings: () => Promise<void>;
  importSettings: () => Promise<void>;
}

export type ConfigStoreState = UiSlice & PersistenceSlice & BrowserSlice;

export type StoreSlice<T> = StateCreator<ConfigStoreState, [], [], T>;

export function createIdleActionState(): ActionState {
  return {
    actionId: null,
    status: 'idle',
    message: null,
    warnings: [],
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

export function resolveImportPayload(
  payload: SettingsExchangeFile | null | undefined
): BrowserSettings | null {
  if (!payload) {
    return null;
  }

  return payload.settings;
}
