use crate::core::config::{AppConfig, BrowserSettings, SettingsExchangeFile, CONFIG_VERSION};
use crate::core::error::{AppError, Result};
use base64::Engine;
use std::fs;
use tauri::AppHandle;

const MAX_IMAGE_SIZE: u64 = 10 * 1024 * 1024; // 10MB

#[derive(Debug, PartialEq, Eq)]
struct DecodedImageDataUrl {
    mime_type: String,
    bytes: Vec<u8>,
}

fn decode_image_data_url(data_url: &str) -> Result<DecodedImageDataUrl> {
    let (metadata, base64_data) = data_url
        .split_once(',')
        .ok_or_else(|| AppError::Io("Invalid data URL".into()))?;

    let metadata = metadata
        .strip_prefix("data:")
        .ok_or_else(|| AppError::Io("Invalid data URL".into()))?;
    let (mime_type, encoding) = metadata
        .split_once(';')
        .ok_or_else(|| AppError::Io("Invalid data URL".into()))?;

    if encoding != "base64" {
        return Err(AppError::Io("Invalid data URL encoding".into()));
    }

    let extension = image_extension_for_mime(mime_type)
        .ok_or_else(|| AppError::Io(format!("Unsupported image type: {mime_type}")))?;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| AppError::Io(format!("Base64 decode error: {}", e)))?;

    Ok(DecodedImageDataUrl {
        mime_type: format!("image/{extension}"),
        bytes,
    })
}

fn image_extension_for_mime(mime_type: &str) -> Option<&'static str> {
    match mime_type {
        "image/png" => Some("png"),
        "image/jpeg" => Some("jpeg"),
        "image/webp" => Some("webp"),
        _ => None,
    }
}

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
        fs::write(p.to_string(), json)?;
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
    let decoded = decode_image_data_url(&data_url)?;
    let extension = image_extension_for_mime(&decoded.mime_type)
        .ok_or_else(|| AppError::Io(format!("Unsupported image type: {}", decoded.mime_type)))?;

    let save_dir = dirs::data_dir()
        .ok_or_else(|| AppError::Io("无法获取数据目录".into()))?
        .join("BrowserBgSwap")
        .join("cropped");

    fs::create_dir_all(&save_dir)?;

    let filename = format!(
        "cropped_{}.{}",
        chrono::Local::now().format("%Y%m%d_%H%M%S_%f"),
        extension
    );
    let save_path = save_dir.join(&filename);
    fs::write(&save_path, decoded.bytes)?;

    Ok(save_path.to_string_lossy().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cropped_image_data_url_requires_supported_image_mime() {
        let error = decode_image_data_url("data:text/plain;base64,SGVsbG8=").unwrap_err();

        assert!(error.to_string().contains("Unsupported image type"));
    }

    #[test]
    fn cropped_image_data_url_decodes_png_without_size_limit() {
        let decoded = decode_image_data_url("data:image/png;base64,aGVsbG8=").unwrap();

        assert_eq!(decoded.mime_type, "image/png");
        assert_eq!(decoded.bytes, b"hello");
    }
}
