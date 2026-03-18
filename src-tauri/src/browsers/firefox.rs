use crate::core::config::{BrowserInfo, BrowserType, PrereqCheck, ProfileInfo};
use crate::core::error::{AppError, Result};
use std::fs;
use std::path::{Path, PathBuf};

pub struct FirefoxManager;

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
        let mut profiles = Vec::new();
        let mut current_profile: Option<ProfileInfo> = None;

        for line in content.lines() {
            let line = line.trim();

            if line.starts_with("[Profile") {
                if let Some(p) = current_profile.take() {
                    profiles.push(p);
                }
                current_profile = Some(ProfileInfo {
                    name: String::new(),
                    path: String::new(),
                    is_default: false,
                });
            } else if let Some(ref mut p) = current_profile {
                if line.starts_with("Name=") {
                    p.name = line[5..].to_string();
                } else if line.starts_with("Path=") {
                    let rel_path = &line[5..];
                    p.path = Self::get_firefox_dir()
                        .ok_or(AppError::Io("无法获取Firefox目录".into()))?
                        .join(rel_path)
                        .to_string_lossy()
                        .to_string();
                } else if line.starts_with("Default=1") {
                    p.is_default = true;
                }
            }
        }

        if let Some(p) = current_profile {
            profiles.push(p);
        }

        Ok(profiles)
    }

    /// 直接扫描Profiles目录
    fn scan_profiles_dir(profiles_dir: &Path) -> Result<Vec<ProfileInfo>> {
        let mut profiles = Vec::new();

        for entry in fs::read_dir(profiles_dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                let name = path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
                if name.ends_with(".default") || name.ends_with(".default-release") {
                    profiles.push(ProfileInfo {
                        name: name.clone(),
                        path: path.to_string_lossy().to_string(),
                        is_default: name.contains("default"),
                    });
                }
            }
        }

        Ok(profiles)
    }

    /// 应用CSS到指定配置文件
    pub fn apply_css(profile_path: &str, css: &str) -> Result<()> {
        let chrome_dir = Path::new(profile_path).join("chrome");
        fs::create_dir_all(&chrome_dir)?;

        let css_path = chrome_dir.join("userContent.css");
        fs::write(&css_path, css)?;

        Ok(())
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

        let pref_key = "toolkit.legacyUserProfileCustomizations.stylesheets";

        let toolkit_enabled = (prefs_path.exists()
            && fs::read_to_string(&prefs_path)?
                .contains(&format!(r#"user_pref("{pref_key}", true);"#)))
            || (user_js_path.exists()
                && fs::read_to_string(&user_js_path)?
                    .contains(&format!(r#"user_pref("{pref_key}", true);"#)));

        let mut instructions = Vec::new();

        if !toolkit_enabled {
            instructions.push(
                "请在about:config中设置 toolkit.legacyUserProfileCustomizations.stylesheets = true"
                    .into(),
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

        let config = r#"// BrowserBgSwap Auto Configuration
user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
"#;

        fs::write(&user_js_path, config)?;
        Ok(())
    }

    /// 创建备份
    pub fn create_backup(profile_path: &str) -> Result<String> {
        let chrome_dir = Path::new(profile_path).join("chrome");
        let css_path = chrome_dir.join("userContent.css");

        if !css_path.exists() {
            return Err(AppError::BackupFailed("无现有CSS需要备份".into()));
        }

        let backup_dir = Self::get_backup_dir()?;
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let backup_name = format!("userContent_backup_{}.css", timestamp);
        let backup_path = backup_dir.join(&backup_name);

        fs::copy(&css_path, &backup_path)?;

        Ok(backup_name)
    }

    /// 恢复备份
    pub fn restore_backup(profile_path: &str, backup_name: &str) -> Result<()> {
        let backup_dir = Self::get_backup_dir()?;
        let backup_path = backup_dir.join(backup_name);
        let css_path = Path::new(profile_path).join("chrome").join("userContent.css");

        if !backup_path.exists() {
            return Err(AppError::BackupFailed("备份文件不存在".into()));
        }

        fs::copy(&backup_path, &css_path)?;
        Ok(())
    }

    /// 获取备份列表
    pub fn list_backups() -> Result<Vec<String>> {
        let backup_dir = Self::get_backup_dir()?;
        let mut backups = Vec::new();

        if backup_dir.exists() {
            for entry in fs::read_dir(&backup_dir)? {
                let entry = entry?;
                if entry.path().extension().map(|e| e == "css").unwrap_or(false) {
                    if let Some(name) = entry.file_name().to_str() {
                        backups.push(name.to_string());
                    }
                }
            }
        }

        backups.sort_by(|a, b| b.cmp(a));
        Ok(backups)
    }

    /// 删除备份
    pub fn delete_backup(backup_name: &str) -> Result<()> {
        let backup_dir = Self::get_backup_dir()?;
        let backup_path = backup_dir.join(backup_name);

        if !backup_path.exists() {
            return Err(AppError::BackupFailed("备份文件不存在".into()));
        }

        fs::remove_file(&backup_path)?;
        Ok(())
    }

    fn get_backup_dir() -> Result<PathBuf> {
        let backup_dir = dirs::data_dir()
            .ok_or(AppError::Io("无法获取数据目录".into()))?
            .join("BrowserBgSwap")
            .join("backups");

        fs::create_dir_all(&backup_dir)?;
        Ok(backup_dir)
    }
}
