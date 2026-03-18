use crate::browsers::chrome::ChromeDetectResult;
use crate::browsers::ChromeManager;
use crate::core::config::BrowserSettings;
use crate::core::error::Result;

#[tauri::command]
pub async fn detect_chrome() -> Result<ChromeDetectResult> {
    ChromeManager::detect()
}

#[tauri::command]
pub async fn apply_chrome_settings(
    settings: BrowserSettings,
    image_path: Option<String>,
) -> Result<String> {
    ChromeManager::apply(&settings, image_path.as_deref())
}

#[tauri::command]
pub async fn remove_chrome_settings() -> Result<()> {
    ChromeManager::remove()
}

