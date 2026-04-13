use crate::core::config::{AppConfig, BrowserSettings, SettingsExchangeFile, CONFIG_VERSION};
use crate::core::error::{AppError, Result};
use crate::utils::fs::{write_atomic, write_atomic_string};
use base64::Engine;
use std::fs;
use tauri::AppHandle;

const MAX_IMAGE_SIZE: u64 = 10 * 1024 * 1024; // 10MB

#[tauri::command]
pub async fn select_image(app: AppHandle) -> Result<Option<String>> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("图片", &["png", "jpg", "jpeg", "gif", "bmp", "webp"])
        .blocking_pick_file();

    if let Some(ref p) = file_path {
        let path_str = p.to_string();
        let metadata = fs::metadata(&path_str)?;
        if metadata.len() > MAX_IMAGE_SIZE {
            return Err(AppError::Io(format!(
                "图片文件过大（{:.1}MB），最大支持10MB",
                metadata.len() as f64 / 1024.0 / 1024.0
            )));
        }
    }

    Ok(file_path.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn open_folder(path: String) -> Result<()> {
    let path = std::path::Path::new(&path);
    if !path.exists() {
        return Err(AppError::Io("目录不存在".into()));
    }
    open::that(path).map_err(|e| AppError::Io(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn get_downloads_dir() -> Result<String> {
    dirs::download_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| AppError::Io("无法获取下载目录".into()))
}

#[tauri::command]
pub async fn save_app_config(config: AppConfig) -> Result<()> {
    let config_dir = dirs::data_dir()
        .ok_or_else(|| crate::core::error::AppError::Io("无法获取数据目录".into()))?
        .join("BrowserBgSwap");

    fs::create_dir_all(&config_dir)?;

    let config_path = config_dir.join("config.json");
    let config_json = serde_json::to_string_pretty(&config.normalized())?;
    write_atomic_string(&config_path, &config_json)?;

    Ok(())
}

#[tauri::command]
pub async fn load_app_config() -> Result<AppConfig> {
    let config_path = dirs::data_dir()
        .ok_or_else(|| crate::core::error::AppError::Io("无法获取数据目录".into()))?
        .join("BrowserBgSwap")
        .join("config.json");

    if !config_path.exists() {
        return Ok(AppConfig::default());
    }

    let config_json = fs::read_to_string(&config_path)?;
    let config: AppConfig = serde_json::from_str(&config_json)?;
    Ok(config.normalized())
}

#[tauri::command]
pub async fn export_settings(
    app: AppHandle,
    browser: String,
    settings: BrowserSettings,
) -> Result<Option<String>> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("JSON", &["json"])
        .set_file_name("browser-settings.json")
        .blocking_save_file();

    if let Some(ref p) = file_path {
        let payload = SettingsExchangeFile {
            version: CONFIG_VERSION,
            browser: Some(browser.trim().to_ascii_lowercase()),
            settings: settings.normalized(),
        };
        let json = serde_json::to_string_pretty(&payload)?;
        write_atomic_string(std::path::Path::new(&p.to_string()), &json)?;
    }

    Ok(file_path.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn import_settings(app: AppHandle) -> Result<Option<SettingsExchangeFile>> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("JSON", &["json"])
        .blocking_pick_file();

    match file_path {
        Some(p) => {
            let json = fs::read_to_string(p.to_string())?;
            if let Ok(payload) = serde_json::from_str::<SettingsExchangeFile>(&json) {
                return Ok(Some(payload.normalized()));
            }

            let settings: BrowserSettings = serde_json::from_str(&json)
                .map_err(|e| AppError::Io(format!("Invalid settings file: {}", e)))?;

            Ok(Some(SettingsExchangeFile {
                version: CONFIG_VERSION,
                browser: None,
                settings: settings.normalized(),
            }))
        }
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn save_cropped_image(data_url: String) -> Result<String> {
    // data_url format: "data:image/png;base64,xxxx..."
    let base64_data = data_url
        .split(',')
        .nth(1)
        .ok_or_else(|| AppError::Io("Invalid data URL".into()))?;

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| AppError::Io(format!("Base64 decode error: {}", e)))?;

    let save_dir = dirs::data_dir()
        .ok_or_else(|| AppError::Io("无法获取数据目录".into()))?
        .join("BrowserBgSwap")
        .join("cropped");

    fs::create_dir_all(&save_dir)?;

    let filename = format!("cropped_{}.png", chrono::Local::now().format("%Y%m%d_%H%M%S"));
    let save_path = save_dir.join(&filename);
    write_atomic(&save_path, &bytes)?;

    Ok(save_path.to_string_lossy().to_string())
}
