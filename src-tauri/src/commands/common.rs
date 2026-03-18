use crate::core::config::{AppConfig, BrowserSettings};
use crate::core::error::{AppError, Result};
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
    let config_json = serde_json::to_string_pretty(&config)?;
    fs::write(&config_path, config_json)?;

    Ok(())
}

#[tauri::command]
pub async fn load_app_config() -> Result<AppConfig> {
    let config_path = dirs::data_dir()
        .ok_or_else(|| crate::core::error::AppError::Io("无法获取数据目录".into()))?
        .join("BrowserBgSwap")
        .join("config.json");

    if !config_path.exists() {
        return Ok(AppConfig {
            firefox: crate::core::config::FirefoxConfig {
                profile_path: None,
                enabled: true,
                settings: crate::core::config::BrowserSettings::default(),
            },
            chrome: crate::core::config::ChromeConfig {
                extension_output_path: None,
                enabled: true,
                settings: crate::core::config::BrowserSettings::default(),
            },
            custom_presets: Vec::new(),
        });
    }

    let config_json = fs::read_to_string(&config_path)?;
    let config: AppConfig = serde_json::from_str(&config_json)?;
    Ok(config)
}

#[tauri::command]
pub async fn export_settings(app: AppHandle, settings: BrowserSettings) -> Result<Option<String>> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("JSON", &["json"])
        .set_file_name("browser-settings.json")
        .blocking_save_file();

    if let Some(ref p) = file_path {
        let json = serde_json::to_string_pretty(&settings)?;
        fs::write(p.to_string(), json)?;
    }

    Ok(file_path.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn import_settings(app: AppHandle) -> Result<Option<BrowserSettings>> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("JSON", &["json"])
        .blocking_pick_file();

    match file_path {
        Some(p) => {
            let json = fs::read_to_string(p.to_string())?;
            let settings: BrowserSettings = serde_json::from_str(&json)
                .map_err(|e| AppError::Io(format!("Invalid settings file: {}", e)))?;
            Ok(Some(settings))
        }
        None => Ok(None),
    }
}
