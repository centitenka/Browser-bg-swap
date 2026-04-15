use crate::browsers::FirefoxManager;
use crate::core::config::{
    ApplyResult, BackupEntry, BrowserInfo, BrowserSettings, PrereqCheck, ValidationResult,
};
use crate::core::error::Result;
use crate::utils::css::CssGenerator;

#[tauri::command]
pub async fn detect_firefox() -> Result<BrowserInfo> {
    FirefoxManager::detect()
}

#[tauri::command]
pub async fn validate_firefox_apply(
    profile_path: String,
    settings: BrowserSettings,
) -> Result<ValidationResult> {
    FirefoxManager::validate_apply(&profile_path, &settings)
}

#[tauri::command]
pub async fn apply_firefox_settings(
    profile_path: String,
    settings: BrowserSettings,
) -> Result<ApplyResult> {
    let css = CssGenerator::generate_user_content_css(&settings);
    FirefoxManager::apply_css(&profile_path, &css)
}

#[tauri::command]
pub async fn remove_firefox_settings(profile_path: String) -> Result<ApplyResult> {
    FirefoxManager::remove_css(&profile_path)
}

#[tauri::command]
pub async fn check_firefox_prerequisites(profile_path: String) -> Result<PrereqCheck> {
    FirefoxManager::check_prerequisites(&profile_path)
}

#[tauri::command]
pub async fn auto_fix_firefox_prerequisites(profile_path: String) -> Result<()> {
    FirefoxManager::auto_fix_prerequisites(&profile_path)
}

#[tauri::command]
pub async fn backup_firefox(profile_path: String) -> Result<String> {
    FirefoxManager::create_backup(&profile_path)
}

#[tauri::command]
pub async fn restore_firefox(profile_path: String, backup_name: String) -> Result<()> {
    FirefoxManager::restore_backup(&profile_path, &backup_name)
}

#[tauri::command]
pub async fn list_firefox_backups(profile_path: String) -> Result<Vec<BackupEntry>> {
    FirefoxManager::list_backups(&profile_path)
}

#[tauri::command]
pub async fn delete_firefox_backup(profile_path: String, backup_name: String) -> Result<()> {
    FirefoxManager::delete_backup(&profile_path, &backup_name)
}
