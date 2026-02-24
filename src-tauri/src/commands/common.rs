use crate::core::config::AppConfig;
use crate::core::error::Result;
use std::fs;
use tauri::AppHandle;

#[tauri::command]
pub async fn select_image(app: AppHandle) -> Result<Option<String>> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("图片", &["png", "jpg", "jpeg", "gif", "bmp", "webp"])
        .blocking_pick_file();

    Ok(file_path.map(|p| p.to_string()))
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
        });
    }

    let config_json = fs::read_to_string(&config_path)?;
    let config: AppConfig = serde_json::from_str(&config_json)?;
    Ok(config)
}
