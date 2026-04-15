use crate::browsers::chrome::{ChromeBundleSnapshotEntry, ChromeDetectResult};
use crate::browsers::ChromeManager;
use crate::core::config::{ApplyResult, BrowserSettings, ValidationResult};
use crate::core::error::Result;

#[tauri::command]
pub async fn detect_chrome() -> Result<ChromeDetectResult> {
    ChromeManager::detect()
}

#[tauri::command]
pub async fn validate_chrome_apply(
    settings: BrowserSettings,
    image_path: Option<String>,
) -> Result<ValidationResult> {
    ChromeManager::validate_apply(&settings, image_path.as_deref())
}

#[tauri::command]
pub async fn apply_chrome_settings(
    settings: BrowserSettings,
    image_path: Option<String>,
) -> Result<ApplyResult> {
    ChromeManager::apply(&settings, image_path.as_deref())
}

#[tauri::command]
pub async fn remove_chrome_settings() -> Result<()> {
    ChromeManager::remove()
}

#[tauri::command]
pub async fn list_chrome_bundle_snapshots() -> Result<Vec<ChromeBundleSnapshotEntry>> {
    ChromeManager::list_bundle_snapshots()
}

#[tauri::command]
pub async fn export_chrome_bundle_snapshot() -> Result<ChromeBundleSnapshotEntry> {
    ChromeManager::export_bundle_snapshot()
}

#[tauri::command]
pub async fn restore_chrome_bundle_snapshot(snapshot_id: String) -> Result<ApplyResult> {
    ChromeManager::restore_bundle_snapshot(&snapshot_id)
}

#[tauri::command]
pub async fn open_extensions_page(browser: String) -> Result<()> {
    ChromeManager::open_extensions_page(browser.trim().to_ascii_lowercase().as_str())
}
