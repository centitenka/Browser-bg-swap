use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub firefox: FirefoxConfig,
    pub chrome: ChromeConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirefoxConfig {
    pub profile_path: Option<String>,
    pub enabled: bool,
    pub settings: BrowserSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChromeConfig {
    pub extension_output_path: Option<String>,
    pub enabled: bool,
    pub settings: BrowserSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserSettings {
    pub background_image: Option<String>,
    pub show_search_box: bool,
    pub show_shortcuts: bool,
}

impl Default for BrowserSettings {
    fn default() -> Self {
        Self {
            background_image: None,
            show_search_box: true,
            show_shortcuts: true,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct BrowserInfo {
    pub browser_type: BrowserType,
    pub installed: bool,
    pub profile_paths: Vec<ProfileInfo>,
}

#[derive(Debug, Clone, Serialize)]
pub enum BrowserType {
    Firefox,
    Chrome,
    Edge,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProfileInfo {
    pub name: String,
    pub path: String,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct PrereqCheck {
    pub toolkit_legacy_enabled: bool,
    pub all_ok: bool,
    pub instructions: Vec<String>,
}
