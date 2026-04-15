import { invoke } from '@tauri-apps/api/core';
import { createImportProjectionWarning, normalizeImportedSettings } from '../../config/normalize';
import type { AppWarning } from '../../types';
import type {
  ApplyResult,
  BackupEntry,
  BrowserInfo,
  BrowserTab,
  ChromeBundleSnapshotEntry,
  ChromeDetectResult,
  DiagnosticsExportPayload,
  ImageLibraryEntry,
  PreparedImageResult,
  PrereqCheck,
  SettingsExchangeFile,
  Shortcut,
  ValidationResult,
} from '../../types';
import {
  formatActionError,
  mergeValidationIntoActionState,
  mergeVerificationIntoActionState,
  resolveSettingsForTab,
  type BrowserSlice,
  type StoreSlice,
} from '../types';

interface SuccessState {
  message?: string | null;
  warnings?: AppWarning[];
  validation?: ValidationResult | null;
  verification?: ApplyResult['verification'] | null;
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
      blocking: [],
      targetSummary: [],
      verification: null,
    });

    try {
      const result = await task();
      const next = successState?.(result);
      const validationState = mergeValidationIntoActionState(next?.validation);
      get().setActionState(tab, {
        actionId,
        status: 'success',
        message: next?.message ?? null,
        ...validationState,
        warnings: next?.warnings ?? validationState.warnings,
        ...mergeVerificationIntoActionState(next?.verification),
      });
      return result;
    } catch (error) {
      get().setActionState(tab, {
        actionId,
        status: 'error',
        message: formatActionError(error),
        warnings: [],
        blocking: [],
        targetSummary: [],
        verification: null,
      });
      throw error;
    } finally {
      get().endRequest();
    }
  }

  async function applyValidation(tab: BrowserTab, validation: ValidationResult | null, successMessage: string) {
    get().setActionState(tab, {
      actionId: tab === 'firefox' ? 'validate_firefox' : 'validate_chrome',
      status: validation?.can_apply === false ? 'error' : 'idle',
      message: validation?.can_apply === false ? successMessage : null,
      ...mergeValidationIntoActionState(validation),
      verification: null,
    });
  }

  return {
    firefoxInfo: null,
    chromeInfo: null,
    prereqCheck: null,
    backups: [],
    chromeSnapshots: [],
    managedImages: [],

    detectFirefox: async () => {
      get().beginRequest();
      try {
        const info = await invoke<BrowserInfo>('detect_firefox');
        const nextProfile =
          get().selectedProfile ||
          info.profile_paths.find((profile) => profile.is_default)?.path ||
          info.profile_paths[0]?.path ||
          '';

        set({ firefoxInfo: info });
        if (nextProfile) {
          get().selectProfile(nextProfile);
          await get().checkPrerequisites();
          await get().loadBackups();
          await get().validateFirefox();
        } else {
          set({ selectedProfile: '', selectedProfileKey: null, backups: [] });
        }
      } catch (error) {
        get().setActionState('firefox', {
          actionId: 'detect_firefox',
          status: 'error',
          message: formatActionError(error),
          warnings: [],
          blocking: [],
          targetSummary: [],
          verification: null,
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
        await get().loadChromeSnapshots();
        await get().validateChrome();
      } catch (error) {
        get().setActionState('chrome', {
          actionId: 'detect_chrome',
          status: 'error',
          message: formatActionError(error),
          warnings: [],
          blocking: [],
          targetSummary: [],
          verification: null,
        });
      } finally {
        get().endRequest();
      }
    },

    validateFirefox: async () => {
      const { selectedProfile, firefoxSettings } = get();
      if (!selectedProfile) {
        set({ prereqCheck: null });
        get().setActionState('firefox', {
          actionId: 'validate_firefox',
          status: 'idle',
          message: null,
          warnings: [],
          blocking: [],
          targetSummary: [],
          verification: null,
        });
        return null;
      }

      const validation = await invoke<ValidationResult>('validate_firefox_apply', {
        profilePath: selectedProfile,
        settings: firefoxSettings,
      });
      await applyValidation('firefox', validation, 'Resolve the Firefox blockers before applying.');
      return validation;
    },

    validateChrome: async () => {
      const settings = resolveSettingsForTab('chrome', get());
      const validation = await invoke<ValidationResult>('validate_chrome_apply', {
        settings,
        imagePath: settings.background_image,
      });
      await applyValidation('chrome', validation, 'Resolve the Chrome / Edge blockers before applying.');
      return validation;
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
          blocking: [],
          targetSummary: [],
          verification: null,
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
          return get().validateFirefox();
        },
        (validation) => ({
          message: 'Firefox prerequisite updated. Fully restart Firefox before testing changes.',
          warnings: [
            {
              code: 'firefox_restart_required',
              message: 'Firefox must be fully restarted after the prerequisite update.',
            },
          ],
          validation,
        })
      );
    },

    applyFirefox: async () => {
      const { selectedProfile, firefoxSettings } = get();
      if (!selectedProfile) {
        throw new Error('No Firefox profile selected.');
      }

      const validation = await get().validateFirefox();
      if (!validation?.can_apply) {
        throw new Error('Firefox validation failed.');
      }

      return runTrackedAction(
        'firefox',
        'apply_firefox',
        async () => {
          const result = await invoke<ApplyResult>('apply_firefox_settings', {
            profilePath: selectedProfile,
            settings: firefoxSettings,
          });
          get().markAppliedSnapshot('firefox');
          await get().saveConfig('firefox');
          await get().checkPrerequisites();
          await get().loadBackups();
          return result;
        },
        (result) => ({
          message: result.backup_name
            ? 'Firefox styles applied. A restore point was created automatically.'
            : 'Firefox styles applied.',
          warnings: [...validation.warnings, ...result.warnings],
          validation,
          verification: result.verification,
        })
      );
    },

    removeFirefox: async () => {
      const { selectedProfile } = get();
      if (!selectedProfile) {
        throw new Error('No Firefox profile selected.');
      }

      return runTrackedAction(
        'firefox',
        'remove_firefox',
        async () => {
          const result = await invoke<ApplyResult>('remove_firefox_settings', {
            profilePath: selectedProfile,
          });
          get().clearAppliedSnapshot('firefox');
          await get().saveConfig('firefox');
          await get().loadBackups();
          await get().validateFirefox();
          return result;
        },
        (result) => ({
          message: 'Firefox CSS removed from the selected profile.',
          warnings: result.warnings,
          verification: result.verification,
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
          get().clearAppliedSnapshot('firefox');
          await get().saveConfig('firefox');
          await get().loadBackups();
          await get().validateFirefox();
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
      const previousBundleExists = !!get().chromeInfo?.extension_exists;
      const validation = await get().validateChrome();
      if (!validation?.can_apply) {
        throw new Error('Chrome validation failed.');
      }

      return runTrackedAction(
        'chrome',
        'apply_chrome',
        async () => {
          const result = await invoke<ApplyResult>('apply_chrome_settings', {
            settings,
            imagePath: settings.background_image,
          });
          get().markAppliedSnapshot('chrome');
          await get().saveConfig('chrome');
          const chromeInfo = await invoke<ChromeDetectResult>('detect_chrome');
          set({ chromeInfo });
          await get().loadChromeSnapshots();
          return result;
        },
        (result) => ({
          message: result.output_path
            ? previousBundleExists
              ? 'Extension bundle updated. Reload it in Chrome or Edge.'
              : 'Extension bundle generated. Load it in Chrome or Edge to activate the new tab page.'
            : 'Extension bundle updated.',
          warnings: [...validation.warnings, ...result.warnings],
          validation,
          verification: result.verification,
        })
      );
    },

    removeChrome: async () => {
      await runTrackedAction(
        'chrome',
        'remove_chrome',
        async () => {
          await invoke('remove_chrome_settings');
          get().clearAppliedSnapshot('chrome');
          await get().saveConfig('chrome');
          const chromeInfo = await invoke<ChromeDetectResult>('detect_chrome');
          set({ chromeInfo });
          await get().loadChromeSnapshots();
        },
        () => ({
          message: 'Extension files removed from the local bundle folder.',
        })
      );
    },

    loadChromeSnapshots: async () => {
      get().beginRequest();
      try {
        const chromeSnapshots = await invoke<ChromeBundleSnapshotEntry[]>('list_chrome_bundle_snapshots');
        set({ chromeSnapshots });
      } finally {
        get().endRequest();
      }
    },

    loadManagedImages: async () => {
      get().beginRequest();
      try {
        const managedImages = await invoke<ImageLibraryEntry[]>('list_image_library');
        set({ managedImages });
      } finally {
        get().endRequest();
      }
    },

    exportChromeSnapshot: async () => {
      return runTrackedAction(
        'chrome',
        'export_chrome_snapshot',
        async () => {
          const snapshot = await invoke<ChromeBundleSnapshotEntry>('export_chrome_bundle_snapshot');
          await get().loadChromeSnapshots();
          return snapshot;
        },
        (snapshot) => ({
          message: `Snapshot exported: ${snapshot.label}`,
        })
      );
    },

    restoreChromeSnapshot: async (snapshotId) => {
      return runTrackedAction(
        'chrome',
        'restore_chrome_snapshot',
        async () => {
          const result = await invoke<ApplyResult>('restore_chrome_bundle_snapshot', {
            snapshotId,
          });
          get().clearAppliedSnapshot('chrome');
          await get().saveConfig('chrome');
          const chromeInfo = await invoke<ChromeDetectResult>('detect_chrome');
          set({ chromeInfo });
          return result;
        },
        (result) => ({
          message: 'Chrome / Edge bundle restored from snapshot.',
          warnings: result.warnings,
          verification: result.verification,
        })
      );
    },

    selectImage: async (managed = true) => {
      get().beginRequest();
      try {
        const prepared = await invoke<PreparedImageResult | null>('select_image', { managed });
        if (prepared) {
          get().updateSettings({
            background_image: prepared.path,
            background_image_mode: prepared.managed ? 'managed' : 'direct',
          });
          get().recordRecentImage(prepared.path);
          await get().loadManagedImages();
        }
        return prepared;
      } catch (error) {
        const tab = get().activeTab;
        get().setActionState(tab, {
          actionId: 'select_image',
          status: 'error',
          message: formatActionError(error),
          warnings: [],
          blocking: [],
          targetSummary: [],
          verification: null,
        });
        return null;
      } finally {
        get().endRequest();
      }
    },

    prepareDroppedImage: async (path, managed = true) => {
      const prepared = await invoke<PreparedImageResult>('prepare_background_image', {
        path,
        managed,
      });
      get().updateSettings({
        background_image: prepared.path,
        background_image_mode: prepared.managed ? 'managed' : 'direct',
      });
      get().recordRecentImage(prepared.path);
      await get().loadManagedImages();
      return prepared;
    },

    importBrowserShortcuts: async (browser) => {
      return runTrackedAction(
        'chrome',
        `import_${browser}_bookmarks`,
        () => invoke<Shortcut[]>('import_browser_shortcuts', { browser }),
        (shortcuts) => ({
          message:
            shortcuts.length > 0
              ? `${browser === 'chrome' ? 'Chrome' : 'Edge'} bookmarks imported.`
              : `${browser === 'chrome' ? 'Chrome' : 'Edge'} bookmarks were empty.`,
        })
      );
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
            get().replaceSettings(activeTab, payload.settings);
            if (payload.settings.background_image) {
              get().recordRecentImage(payload.settings.background_image);
            }
          }
          return payload;
        },
        (payload) => {
          const projectionWarning = createImportProjectionWarning(activeTab, payload);
          return {
            message: 'Settings imported. Review the preview, then apply them.',
            warnings: projectionWarning ? [projectionWarning] : [],
          };
        }
      );
    },

    exportDiagnostics: async (browser = get().activeTab) => {
      return runTrackedAction(
        browser,
        'export_diagnostics',
        () => {
          const state = get();
          const payload: DiagnosticsExportPayload = {
            generated_at: new Date().toISOString(),
            browser,
            config: state.config,
            current_settings: resolveSettingsForTab(browser, state),
            selected_profile: state.selectedProfile || null,
            selected_profile_key: state.selectedProfileKey,
            firefox_info: state.firefoxInfo,
            chrome_info: state.chromeInfo,
            prereq_check: state.prereqCheck,
            backups: state.backups,
            chrome_snapshots: state.chromeSnapshots,
            action_state: state.actionState[browser],
            dirty: state.dirtyByTab[browser],
          };

          return invoke<string | null>('export_diagnostics', { payload });
        },
        () => ({
          message: 'Diagnostics exported.',
        })
      );
    },
  };
};
