use crate::core::config::{
    profile_key_from_path, AppWarning, ApplyResult, BackupEntry, BrowserInfo, BrowserSettings,
    BrowserType, PrereqCheck, ProfileInfo, ValidationResult, VerificationResult,
};
use crate::core::error::{AppError, Result};
use crate::utils::fs::{copy_atomic, write_atomic_string};
use regex::Regex;
use std::fs;
use std::path::{Path, PathBuf};

pub struct FirefoxManager;

const TOOLKIT_PREF_KEY: &str = "toolkit.legacyUserProfileCustomizations.stylesheets";
const AUTO_BACKUP_PREFIX: &str = "userContent_auto_";
const MANUAL_BACKUP_PREFIX: &str = "userContent_manual_";

#[derive(Default)]
struct ProfileSection {
    name: Option<String>,
    path: Option<String>,
    is_default: bool,
    is_relative: bool,
}

impl FirefoxManager {
    pub fn get_firefox_dir() -> Option<PathBuf> {
        dirs::data_dir().map(|d| d.join("Mozilla").join("Firefox"))
    }

    pub fn detect() -> Result<BrowserInfo> {
        let firefox_dir = Self::get_firefox_dir().ok_or(AppError::FirefoxNotInstalled)?;

        if !firefox_dir.exists() {
            return Ok(BrowserInfo {
                browser_type: BrowserType::Firefox,
                installed: false,
                profile_paths: vec![],
            });
        }

        let profiles = Self::scan_profiles(&firefox_dir)?;

        Ok(BrowserInfo {
            browser_type: BrowserType::Firefox,
            installed: !profiles.is_empty(),
            profile_paths: profiles,
        })
    }

    fn scan_profiles(firefox_dir: &Path) -> Result<Vec<ProfileInfo>> {
        let profiles_ini = firefox_dir.join("profiles.ini");

        if profiles_ini.exists() {
            Self::parse_profiles_ini(&profiles_ini)
        } else {
            let profiles_dir = firefox_dir.join("Profiles");
            if profiles_dir.exists() {
                Self::scan_profiles_dir(&profiles_dir)
            } else {
                Ok(vec![])
            }
        }
    }

    fn parse_profiles_ini(path: &Path) -> Result<Vec<ProfileInfo>> {
        let content = fs::read_to_string(path)?;
        let firefox_dir = path
            .parent()
            .ok_or_else(|| AppError::Io("profiles.ini path is invalid".into()))?;
        Self::parse_profiles_ini_content(firefox_dir, &content)
    }

    fn scan_profiles_dir(profiles_dir: &Path) -> Result<Vec<ProfileInfo>> {
        let mut profiles = Vec::new();

        for entry in fs::read_dir(profiles_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                let name = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let path_string = path.to_string_lossy().to_string();

                profiles.push(ProfileInfo {
                    name: name.clone(),
                    path: path_string.clone(),
                    key: profile_key_from_path(&path_string),
                    is_default: name.ends_with(".default") || name.ends_with(".default-release"),
                });
            }
        }

        profiles.sort_by_key(|profile| (!profile.is_default, profile.name.clone()));
        Ok(profiles)
    }

    pub fn validate_apply(
        profile_path: &str,
        settings: &BrowserSettings,
    ) -> Result<ValidationResult> {
        let mut blocking = Vec::new();
        let mut warnings = Vec::new();
        let profile = Path::new(profile_path);
        let css_path = profile.join("chrome").join("userContent.css");

        if !profile.exists() || !profile.is_dir() {
            blocking.push(AppWarning::new(
                "firefox_profile_missing",
                "The selected Firefox profile folder does not exist.",
            ));
        } else if !Self::path_is_writable(profile) {
            blocking.push(AppWarning::new(
                "firefox_profile_not_writable",
                "The selected Firefox profile folder is not writable.",
            ));
        }

        if let Some(image) = settings.background_image.as_deref() {
            let image_path = Path::new(image);
            if !image_path.exists() || !image_path.is_file() {
                blocking.push(AppWarning::new(
                    "background_image_missing",
                    "The selected background image could not be found.",
                ));
            }
        }

        let prereq = Self::check_prerequisites(profile_path)?;
        if !prereq.all_ok {
            blocking.push(AppWarning::with_details(
                "firefox_prerequisite_missing",
                "Firefox still needs the custom stylesheet prerequisite enabled.",
                prereq.instructions.clone(),
            ));
        }

        let prefs_path = profile.join("prefs.js");
        let user_js_path = profile.join("user.js");
        if prefs_path.exists() && !Self::path_is_read_write(&prefs_path) {
            warnings.push(AppWarning::new(
                "firefox_prefs_read_only",
                "prefs.js is read-only, so prerequisite updates may need user.js instead.",
            ));
        }
        if user_js_path.exists() && !Self::path_is_read_write(&user_js_path) {
            warnings.push(AppWarning::new(
                "firefox_user_js_read_only",
                "user.js is read-only, so future prerequisite updates may fail.",
            ));
        }

        let mut target_summary = vec![
            format!("Profile: {profile_path}"),
            format!("CSS target: {}", css_path.to_string_lossy()),
        ];
        if let Some(image) = settings.background_image.as_deref() {
            target_summary.push(format!("Background: {image}"));
        }

        Ok(ValidationResult {
            can_apply: blocking.is_empty(),
            blocking,
            warnings,
            target_summary,
        })
    }

    pub fn apply_css(profile_path: &str, css: &str) -> Result<ApplyResult> {
        let chrome_dir = Path::new(profile_path).join("chrome");
        fs::create_dir_all(&chrome_dir)?;

        let css_path = chrome_dir.join("userContent.css");
        let backup_name = if css_path.exists() {
            Some(Self::create_backup_with_kind(profile_path, "auto")?)
        } else {
            None
        };

        write_atomic_string(&css_path, css)?;

        Ok(ApplyResult {
            success: true,
            output_path: Some(css_path.to_string_lossy().to_string()),
            backup_name,
            warnings: vec![AppWarning::new(
                "firefox_restart_required",
                "Fully restart Firefox after writing CSS to the profile.",
            )],
            verification: VerificationResult {
                verified: css_path.exists(),
                generated_files: vec![css_path.to_string_lossy().to_string()],
                next_action: Some("restart_firefox".into()),
            },
        })
    }

    pub fn remove_css(profile_path: &str) -> Result<ApplyResult> {
        let css_path = Path::new(profile_path)
            .join("chrome")
            .join("userContent.css");
        let backup_name = if css_path.exists() {
            Some(Self::create_backup_with_kind(profile_path, "manual")?)
        } else {
            None
        };

        if css_path.exists() {
            fs::remove_file(&css_path)?;
        }

        Ok(ApplyResult {
            success: true,
            output_path: Some(css_path.to_string_lossy().to_string()),
            backup_name,
            warnings: vec![AppWarning::new(
                "firefox_restart_required",
                "Fully restart Firefox after removing the generated CSS.",
            )],
            verification: VerificationResult {
                verified: !css_path.exists(),
                generated_files: vec![css_path.to_string_lossy().to_string()],
                next_action: Some("restart_firefox".into()),
            },
        })
    }

    pub fn check_prerequisites(profile_path: &str) -> Result<PrereqCheck> {
        let prefs_path = Path::new(profile_path).join("prefs.js");
        let user_js_path = Path::new(profile_path).join("user.js");

        if !prefs_path.exists() && !user_js_path.exists() {
            return Ok(PrereqCheck {
                toolkit_legacy_enabled: false,
                all_ok: false,
                instructions: vec![
                    "Could not find prefs.js or user.js in the selected profile.".into(),
                ],
            });
        }

        let toolkit_enabled = (prefs_path.exists()
            && fs::read_to_string(&prefs_path)?
                .contains(&format!(r#"user_pref("{TOOLKIT_PREF_KEY}", true);"#)))
            || (user_js_path.exists()
                && fs::read_to_string(&user_js_path)?
                    .contains(&format!(r#"user_pref("{TOOLKIT_PREF_KEY}", true);"#)));

        let mut instructions = Vec::new();
        if !toolkit_enabled {
            instructions.push(format!(
                "Enable {TOOLKIT_PREF_KEY} = true in about:config or use Auto configure."
            ));
        }

        Ok(PrereqCheck {
            toolkit_legacy_enabled: toolkit_enabled,
            all_ok: toolkit_enabled,
            instructions,
        })
    }

    pub fn auto_fix_prerequisites(profile_path: &str) -> Result<()> {
        let user_js_path = Path::new(profile_path).join("user.js");
        let existing_content = fs::read_to_string(&user_js_path).unwrap_or_default();
        let merged = Self::merge_user_pref(&existing_content, TOOLKIT_PREF_KEY, true)?;

        if !existing_content.is_empty() && existing_content != merged {
            Self::backup_user_js(profile_path, &existing_content)?;
        }

        write_atomic_string(&user_js_path, &merged)?;
        Ok(())
    }

    pub fn create_backup(profile_path: &str) -> Result<String> {
        Self::create_backup_with_kind(profile_path, "manual")
    }

    fn create_backup_with_kind(profile_path: &str, kind: &str) -> Result<String> {
        let chrome_dir = Path::new(profile_path).join("chrome");
        let css_path = chrome_dir.join("userContent.css");

        if !css_path.exists() {
            return Err(AppError::BackupFailed(
                "No existing Firefox CSS to back up.".into(),
            ));
        }

        let backup_dir = Self::get_backup_dir(profile_path)?;
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let backup_name = match kind {
            "auto" => format!("{AUTO_BACKUP_PREFIX}{timestamp}.css"),
            _ => format!("{MANUAL_BACKUP_PREFIX}{timestamp}.css"),
        };
        let backup_path = backup_dir.join(&backup_name);

        fs::copy(&css_path, &backup_path)?;

        Ok(backup_name)
    }

    pub fn restore_backup(profile_path: &str, backup_name: &str) -> Result<()> {
        let backup_dir = Self::get_backup_dir(profile_path)?;
        let backup_path = backup_dir.join(backup_name);
        let css_path = Path::new(profile_path)
            .join("chrome")
            .join("userContent.css");

        if !backup_path.exists() {
            return Err(AppError::BackupFailed(
                "The requested backup does not exist.".into(),
            ));
        }

        if let Some(parent) = css_path.parent() {
            fs::create_dir_all(parent)?;
        }
        copy_atomic(&backup_path, &css_path)?;
        Ok(())
    }

    pub fn list_backups(profile_path: &str) -> Result<Vec<BackupEntry>> {
        let backup_dir = Self::get_backup_dir(profile_path)?;
        let mut backups = Vec::new();
        let profile_key = profile_key_from_path(profile_path);

        if backup_dir.exists() {
            for entry in fs::read_dir(&backup_dir)? {
                let entry = entry?;
                if entry
                    .path()
                    .extension()
                    .map(|e| e == "css")
                    .unwrap_or(false)
                {
                    if let Some(name) = entry.file_name().to_str() {
                        backups.push(Self::build_backup_entry(name, &profile_key));
                    }
                }
            }
        }

        backups.sort_by(|a, b| b.name.cmp(&a.name));
        Ok(backups)
    }

    pub fn delete_backup(profile_path: &str, backup_name: &str) -> Result<()> {
        let backup_dir = Self::get_backup_dir(profile_path)?;
        let backup_path = backup_dir.join(backup_name);

        if !backup_path.exists() {
            return Err(AppError::BackupFailed(
                "The requested backup does not exist.".into(),
            ));
        }

        fs::remove_file(&backup_path)?;
        Ok(())
    }

    fn get_backup_dir(profile_path: &str) -> Result<PathBuf> {
        let backup_dir = dirs::data_dir()
            .ok_or(AppError::Io("Could not resolve the data directory.".into()))?
            .join("BrowserBgSwap")
            .join("backups")
            .join(profile_key_from_path(profile_path));

        fs::create_dir_all(&backup_dir)?;
        Ok(backup_dir)
    }

    fn build_backup_entry(name: &str, profile_key: &str) -> BackupEntry {
        let timestamp = name
            .strip_prefix(AUTO_BACKUP_PREFIX)
            .or_else(|| name.strip_prefix(MANUAL_BACKUP_PREFIX))
            .unwrap_or(name)
            .strip_suffix(".css")
            .unwrap_or(name);

        let label = Self::format_backup_timestamp(timestamp);
        let source = if name.starts_with(AUTO_BACKUP_PREFIX) {
            "auto"
        } else {
            "manual"
        };

        BackupEntry {
            name: name.to_string(),
            label,
            is_auto: source == "auto",
            source: source.to_string(),
            profile_key: profile_key.to_string(),
        }
    }

    fn format_backup_timestamp(timestamp: &str) -> String {
        if timestamp.len() >= 15 {
            format!(
                "{}/{}/{} {}:{}",
                &timestamp[0..4],
                &timestamp[4..6],
                &timestamp[6..8],
                &timestamp[9..11],
                &timestamp[11..13]
            )
        } else {
            timestamp.to_string()
        }
    }

    fn parse_profiles_ini_content(firefox_dir: &Path, content: &str) -> Result<Vec<ProfileInfo>> {
        let mut profiles = Vec::new();
        let mut current: Option<ProfileSection> = None;

        for raw_line in content.lines() {
            let line = raw_line.trim();
            if line.is_empty() || line.starts_with(';') || line.starts_with('#') {
                continue;
            }

            if line.starts_with('[') && line.ends_with(']') {
                if let Some(section) = current.take() {
                    if let Some(profile) = Self::build_profile_info(firefox_dir, section) {
                        profiles.push(profile);
                    }
                }

                if line.starts_with("[Profile") {
                    current = Some(ProfileSection::default());
                } else {
                    current = None;
                }
                continue;
            }

            let Some((key, value)) = line.split_once('=') else {
                continue;
            };

            if let Some(section) = current.as_mut() {
                match key.trim() {
                    "Name" => section.name = Some(value.trim().to_string()),
                    "Path" => section.path = Some(value.trim().to_string()),
                    "Default" => section.is_default = value.trim() == "1",
                    "IsRelative" => section.is_relative = value.trim() != "0",
                    _ => {}
                }
            }
        }

        if let Some(section) = current {
            if let Some(profile) = Self::build_profile_info(firefox_dir, section) {
                profiles.push(profile);
            }
        }

        profiles.sort_by_key(|profile| (!profile.is_default, profile.name.clone()));
        Ok(profiles)
    }

    fn build_profile_info(firefox_dir: &Path, section: ProfileSection) -> Option<ProfileInfo> {
        let raw_path = section.path?;
        let resolved_path = if section.is_relative {
            firefox_dir.join(raw_path)
        } else {
            PathBuf::from(raw_path)
        };

        if !resolved_path.exists() || !resolved_path.is_dir() {
            return None;
        }

        let path_string = resolved_path.to_string_lossy().to_string();
        let name = section.name.unwrap_or_else(|| {
            resolved_path
                .file_name()
                .map(|name| name.to_string_lossy().to_string())
                .unwrap_or_else(|| "Firefox".to_string())
        });

        Some(ProfileInfo {
            name,
            path: path_string.clone(),
            key: profile_key_from_path(&path_string),
            is_default: section.is_default,
        })
    }

    fn merge_user_pref(content: &str, key: &str, value: bool) -> Result<String> {
        let pattern = format!(
            r#"(?m)^\s*user_pref\("{}"\s*,\s*(true|false)\s*\);\s*$"#,
            regex::escape(key)
        );
        let regex =
            Regex::new(&pattern).map_err(|error| AppError::InvalidConfig(error.to_string()))?;
        let pref_line = format!(r#"user_pref("{}", {});"#, key, value);

        if regex.is_match(content) {
            Ok(regex.replace_all(content, pref_line.as_str()).into_owned())
        } else if content.trim().is_empty() {
            Ok(format!(
                "// BrowserBgSwap Auto Configuration\n{pref_line}\n"
            ))
        } else {
            Ok(format!(
                "{}\n\n// BrowserBgSwap Auto Configuration\n{pref_line}\n",
                content.trim_end()
            ))
        }
    }

    fn backup_user_js(profile_path: &str, content: &str) -> Result<()> {
        let backup_dir = Self::get_backup_dir(profile_path)?.join("prereq");
        fs::create_dir_all(&backup_dir)?;
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let backup_path = backup_dir.join(format!("user_js_backup_{timestamp}.js"));
        write_atomic_string(&backup_path, content)?;
        Ok(())
    }

    fn path_is_read_write(path: &Path) -> bool {
        fs::metadata(path)
            .map(|metadata| !metadata.permissions().readonly())
            .unwrap_or(false)
    }

    fn path_is_writable(path: &Path) -> bool {
        if let Ok(metadata) = fs::metadata(path) {
            if metadata.permissions().readonly() {
                return false;
            }
        }

        let probe = path.join(".browser_bg_swap_probe");
        let result = write_atomic_string(&probe, "ok");
        let _ = fs::remove_file(&probe);
        result.is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn unique_temp_dir(name: &str) -> PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!("browser_bg_swap_{name}_{unique}"));
        fs::create_dir_all(&path).unwrap();
        path
    }

    #[test]
    fn parses_profiles_ini_with_relative_and_absolute_paths() {
        let root = unique_temp_dir("profiles");
        let firefox_dir = root.join("Firefox");
        let relative_profile = firefox_dir.join("Profiles").join("alpha.default-release");
        let absolute_profile = root.join("absolute-profile");
        fs::create_dir_all(&relative_profile).unwrap();
        fs::create_dir_all(&absolute_profile).unwrap();

        let content = format!(
            "[Profile0]\nName=Alpha\nIsRelative=1\nPath=Profiles/alpha.default-release\nDefault=1\n\n[Profile1]\nName=Beta\nIsRelative=0\nPath={}\n",
            absolute_profile.to_string_lossy()
        );

        let profiles = FirefoxManager::parse_profiles_ini_content(&firefox_dir, &content).unwrap();

        assert_eq!(profiles.len(), 2);
        assert_eq!(profiles[0].name, "Alpha");
        assert!(profiles[0].is_default);
        assert_eq!(PathBuf::from(&profiles[0].path), relative_profile);
        assert_eq!(PathBuf::from(&profiles[1].path), absolute_profile);

        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn merges_user_pref_without_losing_existing_content() {
        let content = r#"user_pref("browser.startup.page", 3);
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", false);
"#;

        let merged = FirefoxManager::merge_user_pref(content, TOOLKIT_PREF_KEY, true).unwrap();

        assert!(merged.contains(r#"user_pref("browser.startup.page", 3);"#));
        assert!(merged.contains(
            r#"user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);"#
        ));
        assert!(!merged.contains("false);"));
    }

    #[test]
    fn backup_entries_mark_auto_backups() {
        let auto =
            FirefoxManager::build_backup_entry("userContent_auto_20260412_141500.css", "abc");
        let manual =
            FirefoxManager::build_backup_entry("userContent_manual_20260412_141510.css", "abc");

        assert!(auto.is_auto);
        assert!(!manual.is_auto);
        assert_eq!(auto.label, "2026/04/12 14:15");
        assert_eq!(auto.source, "auto");
        assert_eq!(manual.source, "manual");
    }

    #[test]
    fn validation_blocks_missing_background_images() {
        let root = unique_temp_dir("validation");
        fs::write(
            root.join("prefs.js"),
            format!(r#"user_pref("{TOOLKIT_PREF_KEY}", true);"#),
        )
        .unwrap();

        let mut settings = BrowserSettings::default();
        settings.background_image = Some(root.join("missing.png").to_string_lossy().to_string());

        let result = FirefoxManager::validate_apply(&root.to_string_lossy(), &settings).unwrap();

        assert!(!result.can_apply);
        assert!(result
            .blocking
            .iter()
            .any(|warning| warning.code == "background_image_missing"));

        fs::remove_dir_all(root).unwrap();
    }
}
