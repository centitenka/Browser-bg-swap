use serde::{Deserialize, Serialize};

pub const CONFIG_VERSION: u32 = 3;

fn default_config_version() -> u32 {
    CONFIG_VERSION
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    #[serde(default = "default_config_version")]
    pub config_version: u32,
    pub firefox: FirefoxConfig,
    pub chrome: ChromeConfig,
    #[serde(default)]
    pub custom_presets: Vec<NamedPreset>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirefoxConfig {
    pub profile_path: Option<String>,
    pub settings: BrowserSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChromeConfig {
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
pub struct SettingsExchangeFile {
    #[serde(default = "default_config_version")]
    pub version: u32,
    #[serde(default)]
    pub browser: Option<String>,
    pub settings: BrowserSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppWarning {
    pub code: String,
    pub message: String,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub details: Vec<String>,
}

impl AppWarning {
    pub fn new(code: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details: Vec::new(),
        }
    }

    pub fn with_details(
        code: impl Into<String>,
        message: impl Into<String>,
        details: Vec<String>,
    ) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details,
        }
    }
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

impl Default for FirefoxConfig {
    fn default() -> Self {
        Self {
            profile_path: None,
            settings: BrowserSettings::default(),
        }
    }
}

impl Default for ChromeConfig {
    fn default() -> Self {
        Self {
            settings: BrowserSettings::default(),
        }
    }
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            config_version: CONFIG_VERSION,
            firefox: FirefoxConfig::default(),
            chrome: ChromeConfig::default(),
            custom_presets: Vec::new(),
        }
    }
}

impl SettingsExchangeFile {
    pub fn normalized(self) -> Self {
        let browser = self.browser.map(|browser| {
            let normalized = browser.trim().to_ascii_lowercase();
            if normalized.is_empty() {
                "chrome".to_string()
            } else {
                normalized
            }
        });

        Self {
            version: CONFIG_VERSION,
            browser,
            settings: self.settings.normalized(),
        }
    }
}

impl AppConfig {
    pub fn normalized(self) -> Self {
        let firefox_presets = self
            .custom_presets
            .into_iter()
            .filter_map(|preset| {
                let name = preset.name.trim().to_string();
                if name.is_empty() {
                    None
                } else {
                    Some(NamedPreset {
                        name,
                        settings: preset.settings.normalized(),
                    })
                }
            })
            .collect();

        Self {
            config_version: CONFIG_VERSION,
            firefox: FirefoxConfig {
                profile_path: self.firefox.profile_path.and_then(normalize_optional_text),
                settings: self.firefox.settings.normalized(),
            },
            chrome: ChromeConfig {
                settings: self.chrome.settings.normalized(),
            },
            custom_presets: firefox_presets,
        }
    }
}

impl BrowserSettings {
    pub fn normalized(mut self) -> Self {
        let defaults = Self::default();

        self.background_image = self.background_image.and_then(normalize_optional_text);
        self.overlay_opacity = clamp_u32(self.overlay_opacity, 0, 100);
        self.clock_color = normalize_hex_color(self.clock_color, defaults.clock_color.clone());
        self.clock_size = clamp_u32(self.clock_size, 32, 120);
        self.search_engine = normalize_enum(
            self.search_engine,
            &["google", "bing", "baidu", "duckduckgo"],
            defaults.search_engine.clone(),
        );
        self.clock_position = normalize_position(self.clock_position, defaults.clock_position.clone());
        self.search_position = normalize_position(self.search_position, defaults.search_position.clone());
        self.shortcuts_position =
            normalize_position(self.shortcuts_position, defaults.shortcuts_position.clone());

        self.background_color =
            normalize_hex_color(self.background_color, defaults.background_color.clone());
        self.background_fit = normalize_enum(
            self.background_fit,
            &["cover", "contain", "center", "stretch"],
            defaults.background_fit.clone(),
        );
        self.background_blur = clamp_u32(self.background_blur, 0, 20);
        self.background_brightness = clamp_u32(self.background_brightness, 50, 150);

        self.clock_font_weight = normalize_enum(
            self.clock_font_weight,
            &["light", "normal", "bold"],
            defaults.clock_font_weight.clone(),
        );

        self.search_bg_color =
            normalize_hex_color(self.search_bg_color, defaults.search_bg_color.clone());
        self.search_bg_opacity = clamp_u32(self.search_bg_opacity, 0, 100);
        self.search_border_radius = clamp_u32(self.search_border_radius, 0, 60);
        self.search_placeholder = normalize_text(self.search_placeholder, defaults.search_placeholder.clone());
        self.search_border_width = clamp_u32(self.search_border_width, 0, 5);
        self.search_border_color =
            normalize_hex_color(self.search_border_color, defaults.search_border_color.clone());
        self.search_border_style = normalize_enum(
            self.search_border_style,
            &["none", "solid", "dashed", "double"],
            defaults.search_border_style.clone(),
        );
        self.search_shadow_color =
            normalize_hex_color(self.search_shadow_color, defaults.search_shadow_color.clone());
        self.search_shadow_blur = clamp_u32(self.search_shadow_blur, 0, 40);
        self.search_shadow_opacity = clamp_u32(self.search_shadow_opacity, 0, 100);
        self.search_backdrop_blur = clamp_u32(self.search_backdrop_blur, 0, 20);
        self.search_text_color =
            normalize_hex_color(self.search_text_color, defaults.search_text_color.clone());
        self.search_width = clamp_u32(self.search_width, 300, 800);
        self.search_padding = clamp_u32(self.search_padding, 0, 20);

        self.shortcuts_bg_color =
            normalize_hex_color(self.shortcuts_bg_color, defaults.shortcuts_bg_color.clone());
        self.shortcuts_bg_opacity = clamp_u32(self.shortcuts_bg_opacity, 0, 100);
        self.shortcuts_border_radius = clamp_u32(self.shortcuts_border_radius, 0, 50);
        self.shortcuts_columns = normalize_enum(
            self.shortcuts_columns,
            &["auto", "2", "3", "4", "5", "6"],
            defaults.shortcuts_columns.clone(),
        );
        self.shortcuts_gap = clamp_u32(self.shortcuts_gap, 4, 32);
        self.shortcuts_border_width = clamp_u32(self.shortcuts_border_width, 0, 5);
        self.shortcuts_border_color = normalize_hex_color(
            self.shortcuts_border_color,
            defaults.shortcuts_border_color.clone(),
        );
        self.shortcuts_border_style = normalize_enum(
            self.shortcuts_border_style,
            &["none", "solid", "dashed", "double"],
            defaults.shortcuts_border_style.clone(),
        );
        self.shortcuts_shadow_color = normalize_hex_color(
            self.shortcuts_shadow_color,
            defaults.shortcuts_shadow_color.clone(),
        );
        self.shortcuts_shadow_blur = clamp_u32(self.shortcuts_shadow_blur, 0, 40);
        self.shortcuts_shadow_opacity = clamp_u32(self.shortcuts_shadow_opacity, 0, 100);
        self.shortcuts_backdrop_blur = clamp_u32(self.shortcuts_backdrop_blur, 0, 20);
        self.shortcuts_title_color = normalize_hex_color(
            self.shortcuts_title_color,
            defaults.shortcuts_title_color.clone(),
        );
        self.shortcuts_icon_size = clamp_u32(self.shortcuts_icon_size, 16, 64);
        self.shortcuts_padding_x = clamp_u32(self.shortcuts_padding_x, 0, 30);
        self.shortcuts_padding_y = clamp_u32(self.shortcuts_padding_y, 0, 30);
        self.shortcuts_shape = normalize_enum(
            self.shortcuts_shape,
            &["auto", "square", "circle"],
            defaults.shortcuts_shape.clone(),
        );

        self.clock_shadow_color =
            normalize_hex_color(self.clock_shadow_color, defaults.clock_shadow_color.clone());
        self.clock_shadow_blur = clamp_u32(self.clock_shadow_blur, 0, 30);
        self.clock_shadow_opacity = clamp_u32(self.clock_shadow_opacity, 0, 100);
        self.clock_letter_spacing = self.clock_letter_spacing.clamp(-10, 20);
        self.clock_font_family = normalize_enum(
            self.clock_font_family,
            &["system", "serif", "mono"],
            defaults.clock_font_family.clone(),
        );

        self.overlay_color = normalize_hex_color(self.overlay_color, defaults.overlay_color.clone());
        self.custom_css = self.custom_css.trim().to_string();

        self.shortcuts = normalize_shortcuts(self.shortcuts, &defaults.shortcuts);

        self
    }
}

fn clamp_u32(value: u32, min: u32, max: u32) -> u32 {
    value.clamp(min, max)
}

fn normalize_text(value: String, fallback: String) -> String {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        fallback
    } else {
        trimmed.to_string()
    }
}

fn normalize_optional_text(value: String) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

fn normalize_enum(value: String, allowed: &[&str], fallback: String) -> String {
    let lowered = value.trim().to_ascii_lowercase();
    if allowed.iter().any(|allowed| *allowed == lowered) {
        lowered
    } else {
        fallback
    }
}

fn normalize_hex_color(value: String, fallback: String) -> String {
    let trimmed = value.trim();
    let valid = trimmed.len() == 7
        && trimmed.starts_with('#')
        && trimmed.chars().skip(1).all(|ch| ch.is_ascii_hexdigit());

    if valid {
        trimmed.to_ascii_lowercase()
    } else {
        fallback
    }
}

fn normalize_position(value: ElementPosition, fallback: ElementPosition) -> ElementPosition {
    if !value.x.is_finite() || !value.y.is_finite() {
        return fallback;
    }

    ElementPosition {
        x: value.x.clamp(5.0, 95.0),
        y: value.y.clamp(5.0, 95.0),
    }
}

fn normalize_shortcuts(shortcuts: Vec<Shortcut>, fallback: &[Shortcut]) -> Vec<Shortcut> {
    let normalized: Vec<Shortcut> = shortcuts
        .into_iter()
        .filter_map(|shortcut| {
            let title = shortcut.title.trim().to_string();
            let url = shortcut.url.trim().to_string();
            let icon = shortcut.icon.trim().to_string();

            if title.is_empty() || url.is_empty() {
                return None;
            }

            Some(Shortcut {
                title,
                url,
                icon: if icon.is_empty() { "🔗".to_string() } else { icon },
                position: shortcut.position.map(|position| normalize_position(position, ElementPosition { x: 50.0, y: 68.0 })),
            })
        })
        .take(8)
        .collect();

    if normalized.is_empty() {
        fallback.to_vec()
    } else {
        normalized
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

#[derive(Debug, Clone, Serialize)]
pub struct BackupEntry {
    pub name: String,
    pub label: String,
    pub is_auto: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct ApplyResult {
    pub success: bool,
    pub output_path: Option<String>,
    pub backup_name: Option<String>,
    pub warnings: Vec<AppWarning>,
}
