use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub firefox: FirefoxConfig,
    pub chrome: ChromeConfig,
    #[serde(default)]
    pub custom_presets: Vec<NamedPreset>,
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
pub struct ElementPosition {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shortcut {
    pub title: String,
    pub url: String,
    pub icon: String,
    #[serde(default)]
    pub position: Option<ElementPosition>,
}

fn default_overlay_opacity() -> u32 { 30 }
fn default_true() -> bool { true }
fn default_clock_color() -> String { "#ffffff".into() }
fn default_clock_size() -> u32 { 72 }
fn default_search_engine() -> String { "google".into() }
fn default_clock_position() -> ElementPosition { ElementPosition { x: 50.0, y: 30.0 } }
fn default_search_position() -> ElementPosition { ElementPosition { x: 50.0, y: 48.0 } }
fn default_shortcuts_position() -> ElementPosition { ElementPosition { x: 50.0, y: 68.0 } }

// New default functions
fn default_background_color() -> String { "#1a1a2e".into() }
fn default_background_fit() -> String { "cover".into() }
fn default_clock_font_weight() -> String { "light".into() }
fn default_search_bg_color() -> String { "#ffffff".into() }
fn default_search_bg_opacity() -> u32 { 95 }
fn default_search_border_radius() -> u32 { 28 }
fn default_search_placeholder() -> String { "\u{641C}\u{7D22}...".into() }
fn default_shortcuts_bg_color() -> String { "#ffffff".into() }
fn default_shortcuts_bg_opacity() -> u32 { 90 }
fn default_shortcuts_border_radius() -> u32 { 12 }
fn default_shortcuts_columns() -> String { "auto".into() }
fn default_shortcuts_gap() -> u32 { 12 }
fn default_background_brightness() -> u32 { 100 }
fn default_overlay_color() -> String { "#000000".into() }

// Search fine-grained defaults
fn default_search_border_color() -> String { "#d4af37".into() }
fn default_search_border_style() -> String { "none".into() }
fn default_search_shadow_color() -> String { "#000000".into() }
fn default_search_shadow_blur() -> u32 { 20 }
fn default_search_shadow_opacity() -> u32 { 15 }
fn default_search_text_color() -> String { "#333333".into() }
fn default_search_width() -> u32 { 560 }
fn default_search_padding() -> u32 { 4 }

// Shortcuts fine-grained defaults
fn default_shortcuts_border_color() -> String { "#ffffff".into() }
fn default_shortcuts_border_style() -> String { "none".into() }
fn default_shortcuts_shadow_color() -> String { "#000000".into() }
fn default_shortcuts_title_color() -> String { "#333333".into() }
fn default_shortcuts_icon_size() -> u32 { 36 }
fn default_shortcuts_padding_x() -> u32 { 8 }
fn default_shortcuts_padding_y() -> u32 { 14 }
fn default_shortcuts_shape() -> String { "auto".into() }

// Clock fine-grained defaults
fn default_clock_shadow_color() -> String { "#000000".into() }
fn default_clock_shadow_blur() -> u32 { 10 }
fn default_clock_shadow_opacity() -> u32 { 30 }
fn default_clock_font_family() -> String { "system".into() }

fn default_shortcuts() -> Vec<Shortcut> {
    vec![
        Shortcut { title: "GitHub".into(), url: "https://github.com".into(), icon: "\u{1F4BB}".into(), position: None },
        Shortcut { title: "YouTube".into(), url: "https://youtube.com".into(), icon: "\u{25B6}\u{FE0F}".into(), position: None },
        Shortcut { title: "Bilibili".into(), url: "https://bilibili.com".into(), icon: "\u{1F4FA}".into(), position: None },
        Shortcut { title: "\u{77E5}\u{4E4E}".into(), url: "https://zhihu.com".into(), icon: "\u{2753}".into(), position: None },
    ]
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NamedPreset {
    pub name: String,
    pub settings: BrowserSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserSettings {
    pub background_image: Option<String>,

    #[serde(default = "default_overlay_opacity")]
    pub overlay_opacity: u32,

    #[serde(default = "default_true")]
    pub show_clock: bool,
    #[serde(default = "default_clock_color")]
    pub clock_color: String,
    #[serde(default = "default_clock_size")]
    pub clock_size: u32,

    #[serde(default = "default_true")]
    pub show_search_box: bool,
    #[serde(default = "default_search_engine")]
    pub search_engine: String,

    #[serde(default = "default_true")]
    pub show_shortcuts: bool,
    #[serde(default = "default_shortcuts")]
    pub shortcuts: Vec<Shortcut>,

    #[serde(default = "default_clock_position")]
    pub clock_position: ElementPosition,
    #[serde(default = "default_search_position")]
    pub search_position: ElementPosition,
    #[serde(default = "default_shortcuts_position")]
    pub shortcuts_position: ElementPosition,

    // Background enhancements
    #[serde(default = "default_background_color")]
    pub background_color: String,
    #[serde(default = "default_background_fit")]
    pub background_fit: String,
    #[serde(default)]
    pub background_blur: u32,
    #[serde(default = "default_background_brightness")]
    pub background_brightness: u32,

    // Clock enhancements
    #[serde(default = "default_true")]
    pub clock_format_24h: bool,
    #[serde(default)]
    pub clock_show_seconds: bool,
    #[serde(default)]
    pub clock_show_date: bool,
    #[serde(default = "default_clock_font_weight")]
    pub clock_font_weight: String,

    // Search box enhancements
    #[serde(default = "default_search_bg_color")]
    pub search_bg_color: String,
    #[serde(default = "default_search_bg_opacity")]
    pub search_bg_opacity: u32,
    #[serde(default = "default_search_border_radius")]
    pub search_border_radius: u32,
    #[serde(default = "default_search_placeholder")]
    pub search_placeholder: String,
    #[serde(default)]
    pub search_border_width: u32,
    #[serde(default = "default_search_border_color")]
    pub search_border_color: String,
    #[serde(default = "default_search_border_style")]
    pub search_border_style: String,
    #[serde(default = "default_search_shadow_color")]
    pub search_shadow_color: String,
    #[serde(default = "default_search_shadow_blur")]
    pub search_shadow_blur: u32,
    #[serde(default = "default_search_shadow_opacity")]
    pub search_shadow_opacity: u32,
    #[serde(default)]
    pub search_backdrop_blur: u32,
    #[serde(default = "default_search_text_color")]
    pub search_text_color: String,
    #[serde(default = "default_search_width")]
    pub search_width: u32,
    #[serde(default = "default_search_padding")]
    pub search_padding: u32,

    // Shortcuts enhancements
    #[serde(default = "default_shortcuts_bg_color")]
    pub shortcuts_bg_color: String,
    #[serde(default = "default_shortcuts_bg_opacity")]
    pub shortcuts_bg_opacity: u32,
    #[serde(default = "default_shortcuts_border_radius")]
    pub shortcuts_border_radius: u32,
    #[serde(default = "default_shortcuts_columns")]
    pub shortcuts_columns: String,
    #[serde(default = "default_shortcuts_gap")]
    pub shortcuts_gap: u32,
    #[serde(default)]
    pub shortcuts_border_width: u32,
    #[serde(default = "default_shortcuts_border_color")]
    pub shortcuts_border_color: String,
    #[serde(default = "default_shortcuts_border_style")]
    pub shortcuts_border_style: String,
    #[serde(default = "default_shortcuts_shadow_color")]
    pub shortcuts_shadow_color: String,
    #[serde(default)]
    pub shortcuts_shadow_blur: u32,
    #[serde(default)]
    pub shortcuts_shadow_opacity: u32,
    #[serde(default)]
    pub shortcuts_backdrop_blur: u32,
    #[serde(default = "default_shortcuts_title_color")]
    pub shortcuts_title_color: String,
    #[serde(default = "default_shortcuts_icon_size")]
    pub shortcuts_icon_size: u32,
    #[serde(default = "default_shortcuts_padding_x")]
    pub shortcuts_padding_x: u32,
    #[serde(default = "default_shortcuts_padding_y")]
    pub shortcuts_padding_y: u32,
    #[serde(default = "default_shortcuts_shape")]
    pub shortcuts_shape: String,

    // Clock fine-grained
    #[serde(default = "default_clock_shadow_color")]
    pub clock_shadow_color: String,
    #[serde(default = "default_clock_shadow_blur")]
    pub clock_shadow_blur: u32,
    #[serde(default = "default_clock_shadow_opacity")]
    pub clock_shadow_opacity: u32,
    #[serde(default)]
    pub clock_letter_spacing: i32,
    #[serde(default = "default_clock_font_family")]
    pub clock_font_family: String,

    // Overlay
    #[serde(default = "default_overlay_color")]
    pub overlay_color: String,

    // Advanced
    #[serde(default)]
    pub custom_css: String,
}

impl Default for BrowserSettings {
    fn default() -> Self {
        Self {
            background_image: None,
            overlay_opacity: default_overlay_opacity(),
            show_clock: true,
            clock_color: default_clock_color(),
            clock_size: default_clock_size(),
            show_search_box: true,
            search_engine: default_search_engine(),
            show_shortcuts: true,
            shortcuts: default_shortcuts(),
            clock_position: default_clock_position(),
            search_position: default_search_position(),
            shortcuts_position: default_shortcuts_position(),
            background_color: default_background_color(),
            background_fit: default_background_fit(),
            background_blur: 0,
            background_brightness: default_background_brightness(),
            clock_format_24h: true,
            clock_show_seconds: false,
            clock_show_date: false,
            clock_font_weight: default_clock_font_weight(),
            search_bg_color: default_search_bg_color(),
            search_bg_opacity: default_search_bg_opacity(),
            search_border_radius: default_search_border_radius(),
            search_placeholder: default_search_placeholder(),
            search_border_width: 0,
            search_border_color: default_search_border_color(),
            search_border_style: default_search_border_style(),
            search_shadow_color: default_search_shadow_color(),
            search_shadow_blur: default_search_shadow_blur(),
            search_shadow_opacity: default_search_shadow_opacity(),
            search_backdrop_blur: 0,
            search_text_color: default_search_text_color(),
            search_width: default_search_width(),
            search_padding: default_search_padding(),
            shortcuts_bg_color: default_shortcuts_bg_color(),
            shortcuts_bg_opacity: default_shortcuts_bg_opacity(),
            shortcuts_border_radius: default_shortcuts_border_radius(),
            shortcuts_columns: default_shortcuts_columns(),
            shortcuts_gap: default_shortcuts_gap(),
            shortcuts_border_width: 0,
            shortcuts_border_color: default_shortcuts_border_color(),
            shortcuts_border_style: default_shortcuts_border_style(),
            shortcuts_shadow_color: default_shortcuts_shadow_color(),
            shortcuts_shadow_blur: 0,
            shortcuts_shadow_opacity: 0,
            shortcuts_backdrop_blur: 0,
            shortcuts_title_color: default_shortcuts_title_color(),
            shortcuts_icon_size: default_shortcuts_icon_size(),
            shortcuts_padding_x: default_shortcuts_padding_x(),
            shortcuts_padding_y: default_shortcuts_padding_y(),
            shortcuts_shape: default_shortcuts_shape(),
            clock_shadow_color: default_clock_shadow_color(),
            clock_shadow_blur: default_clock_shadow_blur(),
            clock_shadow_opacity: default_clock_shadow_opacity(),
            clock_letter_spacing: 0,
            clock_font_family: default_clock_font_family(),
            overlay_color: default_overlay_color(),
            custom_css: String::new(),
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
