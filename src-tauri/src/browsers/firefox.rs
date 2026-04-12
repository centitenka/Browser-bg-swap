use crate::core::config::{ApplyResult, BackupEntry, BrowserInfo, BrowserType, PrereqCheck, ProfileInfo};
use crate::core::error::{AppError, Result};
use regex::Regex;
use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
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
    /// 获取Firefox配置目录
    pub fn get_firefox_dir() -> Option<PathBuf> {
        dirs::data_dir().map(|d| d.join("Mozilla").join("Firefox"))
    }

    /// 检测Firefox安装状态和配置文件
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

    /// 扫描所有配置文件
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

    /// 解析profiles.ini
    fn parse_profiles_ini(path: &Path) -> Result<Vec<ProfileInfo>> {
        let content = fs::read_to_string(path)?;
        let firefox_dir = path
            .parent()
            .ok_or_else(|| AppError::Io("profiles.ini 路径无效".into()))?;
        Self::parse_profiles_ini_content(firefox_dir, &content)
    }

    /// 直接扫描Profiles目录
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

                profiles.push(ProfileInfo {
                    name: name.clone(),
                    path: path.to_string_lossy().to_string(),
                    is_default: name.ends_with(".default") || name.ends_with(".default-release"),
                });
            }
        }

        profiles.sort_by_key(|profile| (!profile.is_default, profile.name.clone()));
        Ok(profiles)
    }

    /// 应用CSS到指定配置文件
    pub fn apply_css(profile_path: &str, css: &str) -> Result<ApplyResult> {
        let chrome_dir = Path::new(profile_path).join("chrome");
        fs::create_dir_all(&chrome_dir)?;

        let css_path = chrome_dir.join("userContent.css");
        let backup_name = if css_path.exists() {
            Some(Self::create_backup_with_kind(profile_path, "auto")?)
        } else {
            None
        };
        fs::write(&css_path, css)?;

        Ok(ApplyResult {
            success: true,
            output_path: Some(css_path.to_string_lossy().to_string()),
            backup_name,
            warnings: vec![],
        })
    }

    /// 检查about:config前置条件
    pub fn check_prerequisites(profile_path: &str) -> Result<PrereqCheck> {
        let prefs_path = Path::new(profile_path).join("prefs.js");
        let user_js_path = Path::new(profile_path).join("user.js");

        if !prefs_path.exists() && !user_js_path.exists() {
            return Ok(PrereqCheck {
                toolkit_legacy_enabled: false,
                all_ok: false,
                instructions: vec!["未找到prefs.js/user.js文件".into()],
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
            instructions.push(
                format!("请在about:config中设置 {} = true", TOOLKIT_PREF_KEY),
            );
        }

        let all_ok = toolkit_enabled;

        Ok(PrereqCheck {
            toolkit_legacy_enabled: toolkit_enabled,
            all_ok,
            instructions,
        })
    }

    /// 尝试自动修复（通过创建user.js）
    pub fn auto_fix_prerequisites(profile_path: &str) -> Result<()> {
        let user_js_path = Path::new(profile_path).join("user.js");
        let existing_content = fs::read_to_string(&user_js_path).unwrap_or_default();
        let merged = Self::merge_user_pref(&existing_content, TOOLKIT_PREF_KEY, true)?;

        if !existing_content.is_empty() && existing_content != merged {
            Self::backup_user_js(profile_path, &existing_content)?;
        }

        fs::write(&user_js_path, merged)?;
        Ok(())
    }

    /// 创建备份
    pub fn create_backup(profile_path: &str) -> Result<String> {
        Self::create_backup_with_kind(profile_path, "manual")
    }

    fn create_backup_with_kind(profile_path: &str, kind: &str) -> Result<String> {
        let chrome_dir = Path::new(profile_path).join("chrome");
        let css_path = chrome_dir.join("userContent.css");

        if !css_path.exists() {
            return Err(AppError::BackupFailed("无现有CSS需要备份".into()));
        }

        let backup_dir = Self::get_backup_dir(profile_path)?;
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let backup_name = match kind {
            "auto" => format!("{AUTO_BACKUP_PREFIX}{}.css", timestamp),
            _ => format!("{MANUAL_BACKUP_PREFIX}{}.css", timestamp),
        };
        let backup_path = backup_dir.join(&backup_name);

        fs::copy(&css_path, &backup_path)?;

        Ok(backup_name)
    }

    /// 恢复备份
    pub fn restore_backup(profile_path: &str, backup_name: &str) -> Result<()> {
        let backup_dir = Self::get_backup_dir(profile_path)?;
        let backup_path = backup_dir.join(backup_name);
        let css_path = Path::new(profile_path).join("chrome").join("userContent.css");

        if !backup_path.exists() {
            return Err(AppError::BackupFailed("备份文件不存在".into()));
        }

        if let Some(parent) = css_path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::copy(&backup_path, &css_path)?;
        Ok(())
    }

    /// 获取备份列表
    pub fn list_backups(profile_path: &str) -> Result<Vec<BackupEntry>> {
        let backup_dir = Self::get_backup_dir(profile_path)?;
        let mut backups = Vec::new();

        if backup_dir.exists() {
            for entry in fs::read_dir(&backup_dir)? {
                let entry = entry?;
                if entry.path().extension().map(|e| e == "css").unwrap_or(false) {
                    if let Some(name) = entry.file_name().to_str() {
                        backups.push(Self::build_backup_entry(name));
                    }
                }
            }
        }

        backups.sort_by(|a, b| b.name.cmp(&a.name));
        Ok(backups)
    }

    /// 删除备份
    pub fn delete_backup(profile_path: &str, backup_name: &str) -> Result<()> {
        let backup_dir = Self::get_backup_dir(profile_path)?;
        let backup_path = backup_dir.join(backup_name);

        if !backup_path.exists() {
            return Err(AppError::BackupFailed("备份文件不存在".into()));
        }

        fs::remove_file(&backup_path)?;
        Ok(())
    }

    fn get_backup_dir(profile_path: &str) -> Result<PathBuf> {
        let backup_dir = dirs::data_dir()
            .ok_or(AppError::Io("无法获取数据目录".into()))?
            .join("BrowserBgSwap")
            .join("backups")
            .join(Self::profile_dir_key(profile_path));

        fs::create_dir_all(&backup_dir)?;
        Ok(backup_dir)
    }

    fn build_backup_entry(name: &str) -> BackupEntry {
        let timestamp = name
            .strip_prefix(AUTO_BACKUP_PREFIX)
            .or_else(|| name.strip_prefix(MANUAL_BACKUP_PREFIX))
            .unwrap_or(name)
            .strip_suffix(".css")
            .unwrap_or(name);

        let label = Self::format_backup_timestamp(timestamp);

        BackupEntry {
            name: name.to_string(),
            label,
            is_auto: name.starts_with(AUTO_BACKUP_PREFIX),
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

        let name = section.name.unwrap_or_else(|| {
            resolved_path
                .file_name()
                .map(|name| name.to_string_lossy().to_string())
                .unwrap_or_else(|| "Firefox".to_string())
        });

        Some(ProfileInfo {
            name,
            path: resolved_path.to_string_lossy().to_string(),
            is_default: section.is_default,
        })
    }

    fn merge_user_pref(content: &str, key: &str, value: bool) -> Result<String> {
        let pattern = format!(
            r#"(?m)^\s*user_pref\("{}"\s*,\s*(true|false)\s*\);\s*$"#,
            regex::escape(key)
        );
        let regex = Regex::new(&pattern).map_err(|error| AppError::InvalidConfig(error.to_string()))?;
        let pref_line = format!(r#"user_pref("{}", {});"#, key, value);

        if regex.is_match(content) {
            Ok(regex.replace_all(content, pref_line.as_str()).into_owned())
        } else if content.trim().is_empty() {
            Ok(format!(
                "// BrowserBgSwap Auto Configuration\n{}\n",
                pref_line
            ))
        } else {
            Ok(format!(
                "{}\n\n// BrowserBgSwap Auto Configuration\n{}\n",
                content.trim_end(),
                pref_line
            ))
        }
    }

    fn backup_user_js(profile_path: &str, content: &str) -> Result<()> {
        let backup_dir = Self::get_backup_dir(profile_path)?.join("prereq");
        fs::create_dir_all(&backup_dir)?;
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let backup_path = backup_dir.join(format!("user_js_backup_{}.js", timestamp));
        fs::write(backup_path, content)?;
        Ok(())
    }

    fn profile_dir_key(profile_path: &str) -> String {
        let mut hasher = DefaultHasher::new();
        profile_path.to_ascii_lowercase().hash(&mut hasher);
        format!("{:016x}", hasher.finish())
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
        assert!(merged.contains(r#"user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);"#));
        assert!(!merged.contains("false);"));
    }

    #[test]
    fn profile_backup_keys_are_scoped_per_profile() {
        let first = FirefoxManager::profile_dir_key("C:/Users/test/AppData/Roaming/Mozilla/Firefox/Profiles/a.default-release");
        let second = FirefoxManager::profile_dir_key("C:/Users/test/AppData/Roaming/Mozilla/Firefox/Profiles/b.default-release");

        assert_ne!(first, second);
    }

    #[test]
    fn backup_entries_mark_auto_backups() {
        let auto = FirefoxManager::build_backup_entry("userContent_auto_20260412_141500.css");
        let manual = FirefoxManager::build_backup_entry("userContent_manual_20260412_141510.css");

        assert!(auto.is_auto);
        assert!(!manual.is_auto);
        assert_eq!(auto.label, "2026/04/12 14:15");
    }
}
