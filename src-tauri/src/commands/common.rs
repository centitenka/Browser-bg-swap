use crate::core::config::{AppConfig, BrowserSettings, SettingsExchangeFile, CONFIG_VERSION};
use crate::core::error::{AppError, Result};
use crate::utils::fs::{copy_atomic, write_atomic, write_atomic_string};
use base64::Engine;
use serde::Serialize;
use serde_json::Value;
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;

const MAX_IMAGE_SIZE: u64 = 10 * 1024 * 1024;

#[derive(Debug, Clone, Serialize)]
pub struct PreparedImageResult {
    pub path: String,
    pub original_path: String,
    pub managed: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct ImageLibraryEntry {
    pub path: String,
    pub label: String,
    pub source: String,
    pub modified_at: String,
}

fn browser_data_dir() -> Result<PathBuf> {
    Ok(dirs::data_dir()
        .ok_or_else(|| AppError::Io("Could not resolve the data directory.".into()))?
        .join("BrowserBgSwap"))
}

fn cropped_images_dir() -> Result<PathBuf> {
    Ok(browser_data_dir()?.join("cropped"))
}

fn validate_image_file(path: &Path) -> Result<()> {
    if !path.exists() || !path.is_file() {
        return Err(AppError::Io(
            "The selected image file does not exist.".into(),
        ));
    }

    let metadata = fs::metadata(path)?;
    if metadata.len() > MAX_IMAGE_SIZE {
        return Err(AppError::Io(format!(
            "Image file is too large ({:.1}MB). The limit is 10MB.",
            metadata.len() as f64 / 1024.0 / 1024.0
        )));
    }

    Ok(())
}

fn managed_images_dir() -> Result<PathBuf> {
    Ok(browser_data_dir()?.join("managed-images"))
}

fn managed_copy_name(path: &Path) -> String {
    let stem = path
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("background");
    let ext = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("png");
    format!(
        "{}_{}.{}",
        stem,
        chrono::Local::now().format("%Y%m%d_%H%M%S"),
        ext.to_ascii_lowercase()
    )
}

fn normalize_bookmark_browser(browser: &str) -> Result<&'static str> {
    match browser.trim().to_ascii_lowercase().as_str() {
        "chrome" => Ok("chrome"),
        "edge" => Ok("edge"),
        _ => Err(AppError::Io("Unsupported browser bookmarks source.".into())),
    }
}

fn local_browser_user_data_dir(browser: &str) -> Result<PathBuf> {
    let local_data = dirs::data_local_dir()
        .ok_or_else(|| AppError::Io("Could not resolve the local app data directory.".into()))?;
    let relative = match normalize_bookmark_browser(browser)? {
        "chrome" => PathBuf::from("Google").join("Chrome").join("User Data"),
        "edge" => PathBuf::from("Microsoft").join("Edge").join("User Data"),
        _ => unreachable!(),
    };
    Ok(local_data.join(relative))
}

fn bookmark_file_candidates(browser: &str) -> Result<Vec<PathBuf>> {
    let root = local_browser_user_data_dir(browser)?;
    if !root.exists() {
        return Ok(Vec::new());
    }

    let mut candidates = Vec::new();
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }

        let name = entry.file_name().to_string_lossy().to_string();
        if name == "Default" || name.starts_with("Profile ") {
            let bookmarks = path.join("Bookmarks");
            if bookmarks.exists() && bookmarks.is_file() {
                candidates.push(bookmarks);
            }
        }
    }

    candidates.sort_by_key(|path| {
        let profile = path
            .parent()
            .and_then(|parent| parent.file_name())
            .and_then(|name| name.to_str())
            .unwrap_or("");
        (
            if profile.eq_ignore_ascii_case("Default") { 0 } else { 1 },
            profile.to_string(),
        )
    });
    Ok(candidates)
}

fn infer_shortcut_title(url: &str) -> String {
    let normalized = url
        .trim()
        .trim_start_matches("https://")
        .trim_start_matches("http://");
    let host = normalized.split('/').next().unwrap_or("").trim_start_matches("www.");
    if let Some(segment) = host.split('.').next().filter(|value| !value.is_empty()) {
        return segment.to_string();
    }

    "Shortcut".into()
}

fn collect_bookmark_shortcuts(node: &Value, items: &mut Vec<crate::core::config::Shortcut>, seen: &mut HashSet<String>) {
    if items.len() >= 24 {
        return;
    }

    if node.get("type").and_then(Value::as_str) == Some("url") {
        let url = node
            .get("url")
            .and_then(Value::as_str)
            .map(str::trim)
            .unwrap_or("");
        if (url.starts_with("https://") || url.starts_with("http://"))
            && seen.insert(url.to_ascii_lowercase())
        {
            let fallback_title = infer_shortcut_title(url);
            let title = node
                .get("name")
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .unwrap_or(fallback_title.as_str())
                .to_string();
            items.push(crate::core::config::Shortcut {
                title,
                url: url.to_string(),
                icon: "🔗".into(),
                position: None,
            });
        }
    }

    if let Some(children) = node.get("children").and_then(Value::as_array) {
        for child in children {
            collect_bookmark_shortcuts(child, items, seen);
            if items.len() >= 24 {
                break;
            }
        }
    }
}

fn collect_image_library_entries(dir: &Path, source: &str, entries: &mut Vec<ImageLibraryEntry>) -> Result<()> {
    if !dir.exists() {
        return Ok(());
    }

    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let Some(ext) = path.extension().and_then(|value| value.to_str()) else {
            continue;
        };
        let lowered = ext.to_ascii_lowercase();
        if !["png", "jpg", "jpeg", "gif", "bmp", "webp"].contains(&lowered.as_str()) {
            continue;
        }

        let modified = entry
            .metadata()?
            .modified()
            .ok()
            .map(chrono::DateTime::<chrono::Local>::from)
            .map(|value| value.to_rfc3339())
            .unwrap_or_default();

        entries.push(ImageLibraryEntry {
            path: path.to_string_lossy().to_string(),
            label: path
                .file_name()
                .and_then(|value| value.to_str())
                .unwrap_or("image")
                .to_string(),
            source: source.to_string(),
            modified_at: modified,
        });
    }

    Ok(())
}

fn prepare_image_from_path(raw_path: &str, managed: bool) -> Result<PreparedImageResult> {
    let original_path = PathBuf::from(raw_path.trim());
    validate_image_file(&original_path)?;

    if managed {
        let target_dir = managed_images_dir()?;
        fs::create_dir_all(&target_dir)?;
        let target = target_dir.join(managed_copy_name(&original_path));
        copy_atomic(&original_path, &target)?;
        Ok(PreparedImageResult {
            path: target.to_string_lossy().to_string(),
            original_path: original_path.to_string_lossy().to_string(),
            managed: true,
        })
    } else {
        Ok(PreparedImageResult {
            path: original_path.to_string_lossy().to_string(),
            original_path: original_path.to_string_lossy().to_string(),
            managed: false,
        })
    }
}

#[tauri::command]
pub async fn select_image(
    app: AppHandle,
    managed: Option<bool>,
) -> Result<Option<PreparedImageResult>> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("图片", &["png", "jpg", "jpeg", "gif", "bmp", "webp"])
        .blocking_pick_file();

    match file_path {
        Some(path) => Ok(Some(prepare_image_from_path(
            &path.to_string(),
            managed.unwrap_or(true),
        )?)),
        None => Ok(None),
    }
}

#[tauri::command]
pub async fn prepare_background_image(
    path: String,
    managed: Option<bool>,
) -> Result<PreparedImageResult> {
    prepare_image_from_path(&path, managed.unwrap_or(true))
}

#[tauri::command]
pub async fn open_folder(path: String) -> Result<()> {
    let path = std::path::Path::new(&path);
    if !path.exists() {
        return Err(AppError::Io("Directory does not exist.".into()));
    }
    open::that(path).map_err(|e| AppError::Io(e.to_string()))?;
    Ok(())
}

#[tauri::command]
pub async fn get_downloads_dir() -> Result<String> {
    dirs::download_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| AppError::Io("Could not resolve the downloads directory.".into()))
}

#[tauri::command]
pub async fn save_app_config(config: AppConfig) -> Result<()> {
    let config_dir = dirs::data_dir()
        .ok_or_else(|| {
            crate::core::error::AppError::Io("Could not resolve the data directory.".into())
        })?
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
        .ok_or_else(|| {
            crate::core::error::AppError::Io("Could not resolve the data directory.".into())
        })?
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
        write_atomic_string(Path::new(&p.to_string()), &json)?;
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
                .map_err(|e| AppError::Io(format!("Invalid settings file: {e}")))?;

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
pub async fn list_image_library() -> Result<Vec<ImageLibraryEntry>> {
    let mut entries = Vec::new();
    collect_image_library_entries(&managed_images_dir()?, "managed", &mut entries)?;
    collect_image_library_entries(&cropped_images_dir()?, "cropped", &mut entries)?;

    entries.sort_by(|left, right| {
        right
            .modified_at
            .cmp(&left.modified_at)
            .then_with(|| left.label.cmp(&right.label))
    });
    entries.truncate(24);

    Ok(entries)
}

#[tauri::command]
pub async fn import_browser_shortcuts(browser: String) -> Result<Vec<crate::core::config::Shortcut>> {
    let browser = normalize_bookmark_browser(&browser)?;
    let candidates = bookmark_file_candidates(browser)?;
    if candidates.is_empty() {
        return Err(AppError::Io(format!(
            "No {} bookmarks file was found on this machine.",
            if browser == "chrome" { "Chrome" } else { "Edge" }
        )));
    }

    let mut items = Vec::new();
    let mut seen = HashSet::new();
    for file in candidates {
        let json = fs::read_to_string(file)?;
        let parsed: Value = serde_json::from_str(&json)?;
        if let Some(roots) = parsed.get("roots").and_then(Value::as_object) {
            for root in roots.values() {
                collect_bookmark_shortcuts(root, &mut items, &mut seen);
                if items.len() >= 24 {
                    break;
                }
            }
        }
        if items.len() >= 24 {
            break;
        }
    }

    Ok(items)
}

#[tauri::command]
pub async fn export_diagnostics(
    app: AppHandle,
    payload: Value,
) -> Result<Option<String>> {
    use tauri_plugin_dialog::DialogExt;

    let file_path = app
        .dialog()
        .file()
        .add_filter("JSON", &["json"])
        .set_file_name("browser-bg-swap-diagnostics.json")
        .blocking_save_file();

    if let Some(ref p) = file_path {
        let json = serde_json::to_string_pretty(&payload)?;
        write_atomic_string(Path::new(&p.to_string()), &json)?;
    }

    Ok(file_path.map(|p| p.to_string()))
}

#[tauri::command]
pub async fn save_cropped_image(data_url: String) -> Result<String> {
    let base64_data = data_url
        .split(',')
        .nth(1)
        .ok_or_else(|| AppError::Io("Invalid data URL".into()))?;

    let bytes = base64::engine::general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| AppError::Io(format!("Base64 decode error: {e}")))?;

    let save_dir = cropped_images_dir()?;

    fs::create_dir_all(&save_dir)?;

    let filename = format!(
        "cropped_{}.png",
        chrono::Local::now().format("%Y%m%d_%H%M%S")
    );
    let save_path = save_dir.join(&filename);
    write_atomic(&save_path, &bytes)?;

    Ok(save_path.to_string_lossy().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn infer_shortcut_title_uses_host_segment() {
        assert_eq!(infer_shortcut_title("https://www.github.com/features"), "github");
        assert_eq!(infer_shortcut_title("http://example.org"), "example");
    }

    #[test]
    fn bookmark_parser_collects_unique_urls() {
        let payload = serde_json::json!({
            "roots": {
                "bookmark_bar": {
                    "children": [
                        { "type": "url", "name": "GitHub", "url": "https://github.com" },
                        { "type": "url", "name": "GitHub duplicate", "url": "https://github.com" },
                        {
                            "children": [
                                { "type": "url", "name": "", "url": "https://openai.com/research" }
                            ]
                        }
                    ]
                }
            }
        });

        let mut items = Vec::new();
        let mut seen = HashSet::new();
        collect_bookmark_shortcuts(&payload["roots"]["bookmark_bar"], &mut items, &mut seen);

        assert_eq!(items.len(), 2);
        assert_eq!(items[0].title, "GitHub");
        assert_eq!(items[1].title, "openai");
    }
}
