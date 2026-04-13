use crate::browsers::chrome::ChromeDetectResult;
use crate::browsers::ChromeManager;
use crate::core::config::{ApplyResult, BrowserSettings};
use crate::core::error::Result;

#[tauri::command]
pub async fn detect_chrome() -> Result<ChromeDetectResult> {
    ChromeManager::detect()
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
pub async fn open_extensions_page(browser: String) -> Result<()> {
    ChromeManager::open_extensions_page(browser.trim().to_ascii_lowercase().as_str())
}
