import { invoke } from '@tauri-apps/api/core';
import { normalizeImportedSettings } from '../../config/normalize';
import type {
  ApplyResult,
  BackupEntry,
  BrowserInfo,
  BrowserTab,
  ChromeDetectResult,
  PrereqCheck,
  SettingsExchangeFile,
} from '../../types';
import { formatActionError, resolveSettingsForTab, type BrowserSlice, type StoreSlice } from '../types';

interface SuccessState {
  message?: string | null;
  warnings?: string[];
}

export const createBrowserSlice: StoreSlice<BrowserSlice> = (set, get) => {
  async function runTrackedAction<T>(
    tab: BrowserTab,
    actionId: string,
    task: () => Promise<T>,
    successState?: (result: T) => SuccessState
  ): Promise<T> {
    get().beginRequest();
    get().setActionState(tab, {
      actionId,
      status: 'pending',
      message: null,
      warnings: [],
    });

    try {
      const result = await task();
      const next = successState?.(result);
      get().setActionState(tab, {
        actionId,
        status: 'success',
        message: next?.message ?? null,
        warnings: next?.warnings ?? [],
      });
      return result;
    } catch (error) {
      get().setActionState(tab, {
        actionId,
        status: 'error',
        message: formatActionError(error),
        warnings: [],
      });
      throw error;
    } finally {
      get().endRequest();
    }
  }

  return {
    firefoxInfo: null,
    chromeInfo: null,
    prereqCheck: null,
    backups: [],

    detectFirefox: async () => {
      get().beginRequest();
      try {
        const info = await invoke<BrowserInfo>('detect_firefox');
        const nextProfile =
          get().selectedProfile ||
          info.profile_paths.find((profile) => profile.is_default)?.path ||
          info.profile_paths[0]?.path ||
          '';

        set({
          firefoxInfo: info,
          selectedProfile: nextProfile,
        });
      } catch (error) {
        get().setActionState('firefox', {
          actionId: 'detect_firefox',
          status: 'error',
          message: formatActionError(error),
          warnings: [],
        });
      } finally {
        get().endRequest();
      }
    },

    detectChrome: async () => {
      get().beginRequest();
      try {
        const chromeInfo = await invoke<ChromeDetectResult>('detect_chrome');
        set({ chromeInfo });
      } catch (error) {
        get().setActionState('chrome', {
          actionId: 'detect_chrome',
          status: 'error',
          message: formatActionError(error),
          warnings: [],
        });
      } finally {
        get().endRequest();
      }
    },

    checkPrerequisites: async () => {
      const { selectedProfile } = get();
      if (!selectedProfile) {
        set({ prereqCheck: null });
        return;
      }

      get().beginRequest();
      try {
        const prereqCheck = await invoke<PrereqCheck>('check_firefox_prerequisites', {
          profilePath: selectedProfile,
        });
        set({ prereqCheck });
      } catch (error) {
        get().setActionState('firefox', {
          actionId: 'check_prerequisites',
          status: 'error',
          message: formatActionError(error),
          warnings: [],
        });
      } finally {
        get().endRequest();
      }
    },

    autoFixPrerequisites: async () => {
      const { selectedProfile } = get();
      if (!selectedProfile) {
        return;
      }

      await runTrackedAction(
        'firefox',
        'fix_prerequisites',
        async () => {
          await invoke('auto_fix_firefox_prerequisites', {
            profilePath: selectedProfile,
          });
          await get().checkPrerequisites();
        },
        () => ({
          message: 'Firefox prerequisite updated. Fully restart Firefox before testing changes.',
          warnings: ['Firefox must be fully restarted after the prerequisite update.'],
        })
      );
    },

    applyFirefox: async () => {
      const { selectedProfile, firefoxSettings } = get();
      if (!selectedProfile) {
        throw new Error('No Firefox profile selected.');
      }

      return runTrackedAction(
        'firefox',
        'apply_firefox',
        async () => {
          const result = await invoke<ApplyResult>('apply_firefox_settings', {
            profilePath: selectedProfile,
            settings: firefoxSettings,
          });
          await get().saveConfig('firefox');
          await get().checkPrerequisites();
          await get().loadBackups();
          return result;
        },
        (result) => ({
          message: result.backup_name
            ? 'Firefox styles applied. A restore point was created automatically.'
            : 'Firefox styles applied.',
          warnings: result.warnings,
        })
      );
    },

    createBackup: async () => {
      const { selectedProfile } = get();
      if (!selectedProfile) {
        throw new Error('No Firefox profile selected.');
      }

      return runTrackedAction(
        'firefox',
        'create_backup',
        async () => {
          const backupName = await invoke<string>('backup_firefox', { profilePath: selectedProfile });
          await get().loadBackups();
          return backupName;
        },
        () => ({
          message: 'Backup created for the current Firefox CSS.',
        })
      );
    },

    restoreBackup: async (name) => {
      const { selectedProfile } = get();
      if (!selectedProfile) {
        throw new Error('No Firefox profile selected.');
      }

      await runTrackedAction(
        'firefox',
        'restore_backup',
        async () => {
          await invoke('restore_firefox', {
            profilePath: selectedProfile,
            backupName: name,
          });
          await get().loadBackups();
        },
        () => ({
          message: 'Backup restored. Fully restart Firefox to confirm the result.',
        })
      );
    },

    loadBackups: async () => {
      const { selectedProfile } = get();
      if (!selectedProfile) {
        set({ backups: [] });
        return;
      }

      get().beginRequest();
      try {
        const backups = await invoke<BackupEntry[]>('list_firefox_backups', {
          profilePath: selectedProfile,
        });
        set({ backups });
      } finally {
        get().endRequest();
      }
    },

    deleteBackup: async (name) => {
      const { selectedProfile } = get();
      if (!selectedProfile) {
        throw new Error('No Firefox profile selected.');
      }

      await runTrackedAction(
        'firefox',
        'delete_backup',
        async () => {
          await invoke('delete_firefox_backup', {
            profilePath: selectedProfile,
            backupName: name,
          });
          await get().loadBackups();
        },
        () => ({
          message: 'Backup deleted.',
        })
      );
    },

    applyChrome: async () => {
      const settings = resolveSettingsForTab('chrome', get());

      return runTrackedAction(
        'chrome',
        'apply_chrome',
        async () => {
          const result = await invoke<ApplyResult>('apply_chrome_settings', {
            settings,
            imagePath: settings.background_image,
          });
          await get().saveConfig('chrome');
          const chromeInfo = await invoke<ChromeDetectResult>('detect_chrome');
          set({ chromeInfo });
          return result;
        },
        (result) => ({
          message: result.output_path
            ? 'Extension bundle updated. Load or reload it in Chrome or Edge.'
            : 'Extension bundle updated.',
          warnings: result.warnings,
        })
      );
    },

    removeChrome: async () => {
      await runTrackedAction(
        'chrome',
        'remove_chrome',
        async () => {
          await invoke('remove_chrome_settings');
          const chromeInfo = await invoke<ChromeDetectResult>('detect_chrome');
          set({ chromeInfo });
        },
        () => ({
          message: 'Extension files removed from the local bundle folder.',
        })
      );
    },

    selectImage: async () => {
      get().beginRequest();
      try {
        const path = await invoke<string | null>('select_image');
        if (path) {
          get().updateSettings({ background_image: path });
        }
        return path;
      } catch (error) {
        const tab = get().activeTab;
        get().setActionState(tab, {
          actionId: 'select_image',
          status: 'error',
          message: formatActionError(error),
          warnings: [],
        });
        return null;
      } finally {
        get().endRequest();
      }
    },

    exportSettings: async () => {
      const { activeTab } = get();

      await runTrackedAction(
        activeTab,
        'export_settings',
        async () => {
          await invoke('export_settings', {
            browser: activeTab,
            settings: resolveSettingsForTab(activeTab, get()),
          });
        },
        () => ({
          message: 'Settings exported.',
        })
      );
    },

    importSettings: async () => {
      const { activeTab } = get();

      await runTrackedAction(
        activeTab,
        'import_settings',
        async () => {
          const payload = normalizeImportedSettings(
            activeTab,
            await invoke<SettingsExchangeFile | null>('import_settings')
          );

          if (payload) {
            get().replaceSettings(activeTab, payload.settings, true);
          }
        },
        () => ({
          message: 'Settings imported. Review the preview, then apply them.',
        })
      );
    },
  };
};
