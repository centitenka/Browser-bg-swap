use serde::{Deserialize, Serialize};
use std::collections::HashMap;

include!(concat!(env!("OUT_DIR"), "/config_schema.rs"));

#[derive(Debug, Deserialize)]
struct SharedConfigSchema {
    #[serde(rename = "configVersion")]
    config_version: u32,
    numbers: HashMap<String, NumberRule>,
    enums: HashMap<String, Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct NumberRule {
    min: f64,
    max: f64,
}

fn shared_config_schema() -> SharedConfigSchema {
    serde_json::from_str(include_str!("../../../src/shared/configSchema.json"))
        .expect("shared configSchema.json must be valid")
}

fn default_config_version() -> u32 {
    shared_config_schema().config_version
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
    pub enabled: bool,
    pub settings: BrowserSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChromeConfig {
    #[serde(default)]
    pub extension_output_path: Option<String>,
    pub enabled: bool,
    pub settings: BrowserSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ElementPosition {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ShortcutKind {
    Link,
    Folder,
}

impl Default for ShortcutKind {
    fn default() -> Self {
        Self::Link
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shortcut {
    #[serde(default)]
    pub kind: ShortcutKind,
    pub title: String,
    #[serde(default)]
    pub url: Option<String>,
    pub icon: String,
    #[serde(default)]
    pub position: Option<ElementPosition>,
    #[serde(default)]
    pub children: Vec<Shortcut>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeSettings {
    #[serde(default)]
    pub background: ThemeBackgroundSettings,
    #[serde(default)]
    pub clock: ThemeClockSettings,
    #[serde(default)]
    pub search: ThemeSearchSettings,
    #[serde(default)]
    pub shortcuts: ThemeShortcutsSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeBackgroundSettings {
    #[serde(default = "default_background_color")]
    pub color: String,
    #[serde(default = "default_background_fit")]
    pub fit: String,
    #[serde(default)]
    pub blur: u32,
    #[serde(default = "default_background_brightness")]
    pub brightness: u32,
    #[serde(default = "default_overlay_color")]
    pub overlay_color: String,
    #[serde(default = "default_overlay_opacity")]
    pub overlay_opacity: u32,
    #[serde(default)]
    pub gradient_enabled: bool,
    #[serde(default = "default_background_color")]
    pub gradient_from: String,
    #[serde(default = "default_gradient_to")]
    pub gradient_to: String,
    #[serde(default = "default_gradient_direction")]
    pub gradient_direction: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeClockSettings {
    #[serde(default = "default_clock_color")]
    pub color: String,
    #[serde(default = "default_clock_size")]
    pub size: u32,
    #[serde(default = "default_true")]
    pub format_24h: bool,
    #[serde(default)]
    pub show_seconds: bool,
    #[serde(default)]
    pub show_date: bool,
    #[serde(default = "default_clock_font_weight")]
    pub font_weight: String,
    #[serde(default = "default_clock_font_family")]
    pub font_family: String,
    #[serde(default = "default_clock_shadow_color")]
    pub shadow_color: String,
    #[serde(default = "default_clock_shadow_blur")]
    pub shadow_blur: u32,
    #[serde(default = "default_clock_shadow_opacity")]
    pub shadow_opacity: u32,
    #[serde(default)]
    pub letter_spacing: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeSearchSettings {
    #[serde(default = "default_search_engine")]
    pub engine: String,
    #[serde(default = "default_search_bg_color")]
    pub bg_color: String,
    #[serde(default = "default_search_bg_opacity")]
    pub bg_opacity: u32,
    #[serde(default = "default_search_border_radius")]
    pub border_radius: u32,
    #[serde(default = "default_search_placeholder")]
    pub placeholder: String,
    #[serde(default)]
    pub border_width: u32,
    #[serde(default = "default_search_border_color")]
    pub border_color: String,
    #[serde(default = "default_search_border_style")]
    pub border_style: String,
    #[serde(default = "default_search_shadow_color")]
    pub shadow_color: String,
    #[serde(default = "default_search_shadow_blur")]
    pub shadow_blur: u32,
    #[serde(default = "default_search_shadow_opacity")]
    pub shadow_opacity: u32,
    #[serde(default)]
    pub backdrop_blur: u32,
    #[serde(default = "default_search_text_color")]
    pub text_color: String,
    #[serde(default = "default_search_width")]
    pub width: u32,
    #[serde(default = "default_search_padding")]
    pub padding: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeShortcutsSettings {
    #[serde(default = "default_shortcuts_bg_color")]
    pub bg_color: String,
    #[serde(default = "default_shortcuts_bg_opacity")]
    pub bg_opacity: u32,
    #[serde(default = "default_shortcuts_border_radius")]
    pub border_radius: u32,
    #[serde(default = "default_shortcuts_columns")]
    pub columns: String,
    #[serde(default = "default_shortcuts_gap")]
    pub gap: u32,
    #[serde(default)]
    pub border_width: u32,
    #[serde(default = "default_shortcuts_border_color")]
    pub border_color: String,
    #[serde(default = "default_shortcuts_border_style")]
    pub border_style: String,
    #[serde(default = "default_shortcuts_shadow_color")]
    pub shadow_color: String,
    #[serde(default)]
    pub shadow_blur: u32,
    #[serde(default)]
    pub shadow_opacity: u32,
    #[serde(default)]
    pub backdrop_blur: u32,
    #[serde(default = "default_shortcuts_title_color")]
    pub title_color: String,
    #[serde(default = "default_shortcuts_icon_size")]
    pub icon_size: u32,
    #[serde(default = "default_shortcuts_padding_x")]
    pub padding_x: u32,
    #[serde(default = "default_shortcuts_padding_y")]
    pub padding_y: u32,
    #[serde(default = "default_shortcuts_shape")]
    pub shape: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayoutSettings {
    #[serde(default = "default_clock_position")]
    pub clock_position: ElementPosition,
    #[serde(default = "default_search_position")]
    pub search_position: ElementPosition,
    #[serde(default = "default_shortcuts_position")]
    pub shortcuts_position: ElementPosition,
}

impl Default for ThemeSettings {
    fn default() -> Self {
        Self {
            background: ThemeBackgroundSettings::default(),
            clock: ThemeClockSettings::default(),
            search: ThemeSearchSettings::default(),
            shortcuts: ThemeShortcutsSettings::default(),
        }
    }
}

impl Default for ThemeBackgroundSettings {
    fn default() -> Self {
        Self {
            color: default_background_color(),
            fit: default_background_fit(),
            blur: 0,
            brightness: default_background_brightness(),
            overlay_color: default_overlay_color(),
            overlay_opacity: default_overlay_opacity(),
            gradient_enabled: false,
            gradient_from: default_background_color(),
            gradient_to: default_gradient_to(),
            gradient_direction: default_gradient_direction(),
        }
    }
}

impl Default for ThemeClockSettings {
    fn default() -> Self {
        Self {
            color: default_clock_color(),
            size: default_clock_size(),
            format_24h: true,
            show_seconds: false,
            show_date: false,
            font_weight: default_clock_font_weight(),
            font_family: default_clock_font_family(),
            shadow_color: default_clock_shadow_color(),
            shadow_blur: default_clock_shadow_blur(),
            shadow_opacity: default_clock_shadow_opacity(),
            letter_spacing: 0,
        }
    }
}

impl Default for ThemeSearchSettings {
    fn default() -> Self {
        Self {
            engine: default_search_engine(),
            bg_color: default_search_bg_color(),
            bg_opacity: default_search_bg_opacity(),
            border_radius: default_search_border_radius(),
            placeholder: default_search_placeholder(),
            border_width: 0,
            border_color: default_search_border_color(),
            border_style: default_search_border_style(),
            shadow_color: default_search_shadow_color(),
            shadow_blur: default_search_shadow_blur(),
            shadow_opacity: default_search_shadow_opacity(),
            backdrop_blur: 0,
            text_color: default_search_text_color(),
            width: default_search_width(),
            padding: default_search_padding(),
        }
    }
}

impl Default for ThemeShortcutsSettings {
    fn default() -> Self {
        Self {
            bg_color: default_shortcuts_bg_color(),
            bg_opacity: default_shortcuts_bg_opacity(),
            border_radius: default_shortcuts_border_radius(),
            columns: default_shortcuts_columns(),
            gap: default_shortcuts_gap(),
            border_width: 0,
            border_color: default_shortcuts_border_color(),
            border_style: default_shortcuts_border_style(),
            shadow_color: default_shortcuts_shadow_color(),
            shadow_blur: 0,
            shadow_opacity: 0,
            backdrop_blur: 0,
            title_color: default_shortcuts_title_color(),
            icon_size: default_shortcuts_icon_size(),
            padding_x: default_shortcuts_padding_x(),
            padding_y: default_shortcuts_padding_y(),
            shape: default_shortcuts_shape(),
        }
    }
}

impl Default for LayoutSettings {
    fn default() -> Self {
        Self {
            clock_position: default_clock_position(),
            search_position: default_search_position(),
            shortcuts_position: default_shortcuts_position(),
        }
    }
}

fn default_overlay_opacity() -> u32 {
    30
}
fn default_true() -> bool {
    true
}
fn default_clock_color() -> String {
    "#ffffff".into()
}
fn default_clock_size() -> u32 {
    72
}
fn default_search_engine() -> String {
    "google".into()
}
fn default_clock_position() -> ElementPosition {
    ElementPosition { x: 50.0, y: 30.0 }
}
fn default_search_position() -> ElementPosition {
    ElementPosition { x: 50.0, y: 48.0 }
}
fn default_shortcuts_position() -> ElementPosition {
    ElementPosition { x: 50.0, y: 68.0 }
}

// New default functions
fn default_background_color() -> String {
    "#1a1a2e".into()
}
fn default_background_fit() -> String {
    "cover".into()
}
fn default_clock_font_weight() -> String {
    "light".into()
}
fn default_search_bg_color() -> String {
    "#ffffff".into()
}
fn default_search_bg_opacity() -> u32 {
    95
}
fn default_search_border_radius() -> u32 {
    28
}
fn default_search_placeholder() -> String {
    "\u{641C}\u{7D22}...".into()
}
fn default_shortcuts_bg_color() -> String {
    "#ffffff".into()
}
fn default_shortcuts_bg_opacity() -> u32 {
    90
}
fn default_shortcuts_border_radius() -> u32 {
    12
}
fn default_shortcuts_columns() -> String {
    "auto".into()
}
fn default_shortcuts_gap() -> u32 {
    12
}
fn default_background_brightness() -> u32 {
    100
}
fn default_overlay_color() -> String {
    "#000000".into()
}

fn default_gradient_to() -> String {
    "#2d3250".into()
}

fn default_gradient_direction() -> String {
    "to-bottom".into()
}

// Search fine-grained defaults
fn default_search_border_color() -> String {
    "#d4af37".into()
}
fn default_search_border_style() -> String {
    "none".into()
}
fn default_search_shadow_color() -> String {
    "#000000".into()
}
fn default_search_shadow_blur() -> u32 {
    20
}
fn default_search_shadow_opacity() -> u32 {
    15
}
fn default_search_text_color() -> String {
    "#333333".into()
}
fn default_search_width() -> u32 {
    560
}
fn default_search_padding() -> u32 {
    4
}

// Shortcuts fine-grained defaults
fn default_shortcuts_border_color() -> String {
    "#ffffff".into()
}
fn default_shortcuts_border_style() -> String {
    "none".into()
}
fn default_shortcuts_shadow_color() -> String {
    "#000000".into()
}
fn default_shortcuts_title_color() -> String {
    "#333333".into()
}
fn default_shortcuts_icon_size() -> u32 {
    36
}
fn default_shortcuts_padding_x() -> u32 {
    8
}
fn default_shortcuts_padding_y() -> u32 {
    14
}
fn default_shortcuts_shape() -> String {
    "auto".into()
}

// Clock fine-grained defaults
fn default_clock_shadow_color() -> String {
    "#000000".into()
}
fn default_clock_shadow_blur() -> u32 {
    10
}
fn default_clock_shadow_opacity() -> u32 {
    30
}
fn default_clock_font_family() -> String {
    "system".into()
}

fn default_shortcuts() -> Vec<Shortcut> {
    vec![
        Shortcut {
            kind: ShortcutKind::Link,
            title: "GitHub".into(),
            url: Some("https://github.com".into()),
            icon: "\u{1F4BB}".into(),
            position: None,
            children: Vec::new(),
        },
        Shortcut {
            kind: ShortcutKind::Link,
            title: "YouTube".into(),
            url: Some("https://youtube.com".into()),
            icon: "\u{25B6}\u{FE0F}".into(),
            position: None,
            children: Vec::new(),
        },
        Shortcut {
            kind: ShortcutKind::Link,
            title: "Bilibili".into(),
            url: Some("https://bilibili.com".into()),
            icon: "\u{1F4FA}".into(),
            position: None,
            children: Vec::new(),
        },
        Shortcut {
            kind: ShortcutKind::Link,
            title: "\u{77E5}\u{4E4E}".into(),
            url: Some("https://zhihu.com".into()),
            icon: "\u{2753}".into(),
            position: None,
            children: Vec::new(),
        },
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
pub struct BrowserSettings {
    pub background_image: Option<String>,

    #[serde(default)]
    pub theme: ThemeSettings,
    #[serde(default)]
    pub layout: LayoutSettings,

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
        serde_json::from_str(include_str!("../../../src/shared/defaultSettings.json"))
            .expect("shared defaultSettings.json must match BrowserSettings")
    }
}

impl Default for FirefoxConfig {
    fn default() -> Self {
        Self {
            profile_path: None,
            enabled: true,
            settings: BrowserSettings::default(),
        }
    }
}

impl Default for ChromeConfig {
    fn default() -> Self {
        Self {
            extension_output_path: None,
            enabled: true,
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
                enabled: self.firefox.enabled,
                settings: self.firefox.settings.normalized(),
            },
            chrome: ChromeConfig {
                extension_output_path: self
                    .chrome
                    .extension_output_path
                    .and_then(normalize_optional_text),
                enabled: self.chrome.enabled,
                settings: self.chrome.settings.normalized(),
            },
            custom_presets: firefox_presets,
        }
    }
}

impl BrowserSettings {
    pub fn normalized(mut self) -> Self {
        let defaults = Self::default();
        let schema = shared_config_schema();

        self.background_image = self.background_image.and_then(normalize_optional_text);
        self.overlay_opacity = clamp_u32(&schema, "overlay_opacity", self.overlay_opacity);
        self.clock_color = normalize_hex_color(self.clock_color, defaults.clock_color.clone());
        self.clock_size = clamp_u32(&schema, "clock_size", self.clock_size);
        self.search_engine = normalize_enum(
            &schema,
            "search_engine",
            self.search_engine,
            defaults.search_engine.clone(),
        );
        self.clock_position =
            normalize_position(self.clock_position, defaults.clock_position.clone());
        self.search_position =
            normalize_position(self.search_position, defaults.search_position.clone());
        self.shortcuts_position =
            normalize_position(self.shortcuts_position, defaults.shortcuts_position.clone());

        self.background_color =
            normalize_hex_color(self.background_color, defaults.background_color.clone());
        self.background_fit = normalize_enum(
            &schema,
            "background_fit",
            self.background_fit,
            defaults.background_fit.clone(),
        );
        self.background_blur = clamp_u32(&schema, "background_blur", self.background_blur);
        self.background_brightness =
            clamp_u32(&schema, "background_brightness", self.background_brightness);

        self.clock_font_weight = normalize_enum(
            &schema,
            "clock_font_weight",
            self.clock_font_weight,
            defaults.clock_font_weight.clone(),
        );

        self.search_bg_color =
            normalize_hex_color(self.search_bg_color, defaults.search_bg_color.clone());
        self.search_bg_opacity = clamp_u32(&schema, "search_bg_opacity", self.search_bg_opacity);
        self.search_border_radius =
            clamp_u32(&schema, "search_border_radius", self.search_border_radius);
        self.search_placeholder =
            normalize_text(self.search_placeholder, defaults.search_placeholder.clone());
        self.search_border_width =
            clamp_u32(&schema, "search_border_width", self.search_border_width);
        self.search_border_color = normalize_hex_color(
            self.search_border_color,
            defaults.search_border_color.clone(),
        );
        self.search_border_style = normalize_enum(
            &schema,
            "search_border_style",
            self.search_border_style,
            defaults.search_border_style.clone(),
        );
        self.search_shadow_color = normalize_hex_color(
            self.search_shadow_color,
            defaults.search_shadow_color.clone(),
        );
        self.search_shadow_blur = clamp_u32(&schema, "search_shadow_blur", self.search_shadow_blur);
        self.search_shadow_opacity =
            clamp_u32(&schema, "search_shadow_opacity", self.search_shadow_opacity);
        self.search_backdrop_blur =
            clamp_u32(&schema, "search_backdrop_blur", self.search_backdrop_blur);
        self.search_text_color =
            normalize_hex_color(self.search_text_color, defaults.search_text_color.clone());
        self.search_width = clamp_u32(&schema, "search_width", self.search_width);
        self.search_padding = clamp_u32(&schema, "search_padding", self.search_padding);

        self.shortcuts_bg_color =
            normalize_hex_color(self.shortcuts_bg_color, defaults.shortcuts_bg_color.clone());
        self.shortcuts_bg_opacity =
            clamp_u32(&schema, "shortcuts_bg_opacity", self.shortcuts_bg_opacity);
        self.shortcuts_border_radius = clamp_u32(
            &schema,
            "shortcuts_border_radius",
            self.shortcuts_border_radius,
        );
        self.shortcuts_columns = normalize_enum(
            &schema,
            "shortcuts_columns",
            self.shortcuts_columns,
            defaults.shortcuts_columns.clone(),
        );
        self.shortcuts_gap = clamp_u32(&schema, "shortcuts_gap", self.shortcuts_gap);
        self.shortcuts_border_width = clamp_u32(
            &schema,
            "shortcuts_border_width",
            self.shortcuts_border_width,
        );
        self.shortcuts_border_color = normalize_hex_color(
            self.shortcuts_border_color,
            defaults.shortcuts_border_color.clone(),
        );
        self.shortcuts_border_style = normalize_enum(
            &schema,
            "shortcuts_border_style",
            self.shortcuts_border_style,
            defaults.shortcuts_border_style.clone(),
        );
        self.shortcuts_shadow_color = normalize_hex_color(
            self.shortcuts_shadow_color,
            defaults.shortcuts_shadow_color.clone(),
        );
        self.shortcuts_shadow_blur =
            clamp_u32(&schema, "shortcuts_shadow_blur", self.shortcuts_shadow_blur);
        self.shortcuts_shadow_opacity = clamp_u32(
            &schema,
            "shortcuts_shadow_opacity",
            self.shortcuts_shadow_opacity,
        );
        self.shortcuts_backdrop_blur = clamp_u32(
            &schema,
            "shortcuts_backdrop_blur",
            self.shortcuts_backdrop_blur,
        );
        self.shortcuts_title_color = normalize_hex_color(
            self.shortcuts_title_color,
            defaults.shortcuts_title_color.clone(),
        );
        self.shortcuts_icon_size =
            clamp_u32(&schema, "shortcuts_icon_size", self.shortcuts_icon_size);
        self.shortcuts_padding_x =
            clamp_u32(&schema, "shortcuts_padding_x", self.shortcuts_padding_x);
        self.shortcuts_padding_y =
            clamp_u32(&schema, "shortcuts_padding_y", self.shortcuts_padding_y);
        self.shortcuts_shape = normalize_enum(
            &schema,
            "shortcuts_shape",
            self.shortcuts_shape,
            defaults.shortcuts_shape.clone(),
        );

        self.clock_shadow_color =
            normalize_hex_color(self.clock_shadow_color, defaults.clock_shadow_color.clone());
        self.clock_shadow_blur = clamp_u32(&schema, "clock_shadow_blur", self.clock_shadow_blur);
        self.clock_shadow_opacity =
            clamp_u32(&schema, "clock_shadow_opacity", self.clock_shadow_opacity);
        self.clock_letter_spacing =
            clamp_i32(&schema, "clock_letter_spacing", self.clock_letter_spacing);
        self.clock_font_family = normalize_enum(
            &schema,
            "clock_font_family",
            self.clock_font_family,
            defaults.clock_font_family.clone(),
        );

        self.overlay_color =
            normalize_hex_color(self.overlay_color, defaults.overlay_color.clone());
        self.custom_css = self.custom_css.trim().to_string();

        self.shortcuts = normalize_shortcuts(self.shortcuts, &defaults.shortcuts);
        self.theme = normalize_theme_settings(self.theme.clone(), &self, &defaults, &schema);
        self.layout = normalize_layout_settings(self.layout.clone(), &self, &defaults);
        mirror_theme_to_legacy_fields(&mut self);
        mirror_layout_to_legacy_fields(&mut self);

        self
    }
}

fn use_theme_string(value: String, default_value: &str, legacy: &str) -> String {
    if value == default_value {
        legacy.to_string()
    } else {
        value
    }
}

fn use_theme_u32(value: u32, default_value: u32, legacy: u32) -> u32 {
    if value == default_value {
        legacy
    } else {
        value
    }
}

fn use_theme_i32(value: i32, default_value: i32, legacy: i32) -> i32 {
    if value == default_value {
        legacy
    } else {
        value
    }
}

fn use_theme_bool(value: bool, default_value: bool, legacy: bool) -> bool {
    if value == default_value {
        legacy
    } else {
        value
    }
}

fn normalize_theme_settings(
    theme: ThemeSettings,
    legacy: &BrowserSettings,
    defaults: &BrowserSettings,
    schema: &SharedConfigSchema,
) -> ThemeSettings {
    let default_theme = &defaults.theme;
    let background = ThemeBackgroundSettings {
        color: normalize_hex_color(
            use_theme_string(
                theme.background.color,
                &default_theme.background.color,
                &legacy.background_color,
            ),
            default_theme.background.color.clone(),
        ),
        fit: normalize_enum(
            schema,
            "background_fit",
            use_theme_string(
                theme.background.fit,
                &default_theme.background.fit,
                &legacy.background_fit,
            ),
            default_theme.background.fit.clone(),
        ),
        blur: clamp_u32(
            schema,
            "background_blur",
            use_theme_u32(
                theme.background.blur,
                default_theme.background.blur,
                legacy.background_blur,
            ),
        ),
        brightness: clamp_u32(
            schema,
            "background_brightness",
            use_theme_u32(
                theme.background.brightness,
                default_theme.background.brightness,
                legacy.background_brightness,
            ),
        ),
        overlay_color: normalize_hex_color(
            use_theme_string(
                theme.background.overlay_color,
                &default_theme.background.overlay_color,
                &legacy.overlay_color,
            ),
            default_theme.background.overlay_color.clone(),
        ),
        overlay_opacity: clamp_u32(
            schema,
            "overlay_opacity",
            use_theme_u32(
                theme.background.overlay_opacity,
                default_theme.background.overlay_opacity,
                legacy.overlay_opacity,
            ),
        ),
        gradient_enabled: theme.background.gradient_enabled,
        gradient_from: normalize_hex_color(
            theme.background.gradient_from,
            default_theme.background.gradient_from.clone(),
        ),
        gradient_to: normalize_hex_color(
            theme.background.gradient_to,
            default_theme.background.gradient_to.clone(),
        ),
        gradient_direction: normalize_enum(
            schema,
            "gradient_direction",
            theme.background.gradient_direction,
            default_theme.background.gradient_direction.clone(),
        ),
    };

    let clock = ThemeClockSettings {
        color: normalize_hex_color(
            use_theme_string(
                theme.clock.color,
                &default_theme.clock.color,
                &legacy.clock_color,
            ),
            default_theme.clock.color.clone(),
        ),
        size: clamp_u32(
            schema,
            "clock_size",
            use_theme_u32(
                theme.clock.size,
                default_theme.clock.size,
                legacy.clock_size,
            ),
        ),
        format_24h: use_theme_bool(
            theme.clock.format_24h,
            default_theme.clock.format_24h,
            legacy.clock_format_24h,
        ),
        show_seconds: use_theme_bool(
            theme.clock.show_seconds,
            default_theme.clock.show_seconds,
            legacy.clock_show_seconds,
        ),
        show_date: use_theme_bool(
            theme.clock.show_date,
            default_theme.clock.show_date,
            legacy.clock_show_date,
        ),
        font_weight: normalize_enum(
            schema,
            "clock_font_weight",
            use_theme_string(
                theme.clock.font_weight,
                &default_theme.clock.font_weight,
                &legacy.clock_font_weight,
            ),
            default_theme.clock.font_weight.clone(),
        ),
        font_family: normalize_enum(
            schema,
            "clock_font_family",
            use_theme_string(
                theme.clock.font_family,
                &default_theme.clock.font_family,
                &legacy.clock_font_family,
            ),
            default_theme.clock.font_family.clone(),
        ),
        shadow_color: normalize_hex_color(
            use_theme_string(
                theme.clock.shadow_color,
                &default_theme.clock.shadow_color,
                &legacy.clock_shadow_color,
            ),
            default_theme.clock.shadow_color.clone(),
        ),
        shadow_blur: clamp_u32(
            schema,
            "clock_shadow_blur",
            use_theme_u32(
                theme.clock.shadow_blur,
                default_theme.clock.shadow_blur,
                legacy.clock_shadow_blur,
            ),
        ),
        shadow_opacity: clamp_u32(
            schema,
            "clock_shadow_opacity",
            use_theme_u32(
                theme.clock.shadow_opacity,
                default_theme.clock.shadow_opacity,
                legacy.clock_shadow_opacity,
            ),
        ),
        letter_spacing: clamp_i32(
            schema,
            "clock_letter_spacing",
            use_theme_i32(
                theme.clock.letter_spacing,
                default_theme.clock.letter_spacing,
                legacy.clock_letter_spacing,
            ),
        ),
    };

    let search = ThemeSearchSettings {
        engine: normalize_enum(
            schema,
            "search_engine",
            use_theme_string(
                theme.search.engine,
                &default_theme.search.engine,
                &legacy.search_engine,
            ),
            default_theme.search.engine.clone(),
        ),
        bg_color: normalize_hex_color(
            use_theme_string(
                theme.search.bg_color,
                &default_theme.search.bg_color,
                &legacy.search_bg_color,
            ),
            default_theme.search.bg_color.clone(),
        ),
        bg_opacity: clamp_u32(
            schema,
            "search_bg_opacity",
            use_theme_u32(
                theme.search.bg_opacity,
                default_theme.search.bg_opacity,
                legacy.search_bg_opacity,
            ),
        ),
        border_radius: clamp_u32(
            schema,
            "search_border_radius",
            use_theme_u32(
                theme.search.border_radius,
                default_theme.search.border_radius,
                legacy.search_border_radius,
            ),
        ),
        placeholder: normalize_text(
            use_theme_string(
                theme.search.placeholder,
                &default_theme.search.placeholder,
                &legacy.search_placeholder,
            ),
            default_theme.search.placeholder.clone(),
        ),
        border_width: clamp_u32(
            schema,
            "search_border_width",
            use_theme_u32(
                theme.search.border_width,
                default_theme.search.border_width,
                legacy.search_border_width,
            ),
        ),
        border_color: normalize_hex_color(
            use_theme_string(
                theme.search.border_color,
                &default_theme.search.border_color,
                &legacy.search_border_color,
            ),
            default_theme.search.border_color.clone(),
        ),
        border_style: normalize_enum(
            schema,
            "search_border_style",
            use_theme_string(
                theme.search.border_style,
                &default_theme.search.border_style,
                &legacy.search_border_style,
            ),
            default_theme.search.border_style.clone(),
        ),
        shadow_color: normalize_hex_color(
            use_theme_string(
                theme.search.shadow_color,
                &default_theme.search.shadow_color,
                &legacy.search_shadow_color,
            ),
            default_theme.search.shadow_color.clone(),
        ),
        shadow_blur: clamp_u32(
            schema,
            "search_shadow_blur",
            use_theme_u32(
                theme.search.shadow_blur,
                default_theme.search.shadow_blur,
                legacy.search_shadow_blur,
            ),
        ),
        shadow_opacity: clamp_u32(
            schema,
            "search_shadow_opacity",
            use_theme_u32(
                theme.search.shadow_opacity,
                default_theme.search.shadow_opacity,
                legacy.search_shadow_opacity,
            ),
        ),
        backdrop_blur: clamp_u32(
            schema,
            "search_backdrop_blur",
            use_theme_u32(
                theme.search.backdrop_blur,
                default_theme.search.backdrop_blur,
                legacy.search_backdrop_blur,
            ),
        ),
        text_color: normalize_hex_color(
            use_theme_string(
                theme.search.text_color,
                &default_theme.search.text_color,
                &legacy.search_text_color,
            ),
            default_theme.search.text_color.clone(),
        ),
        width: clamp_u32(
            schema,
            "search_width",
            use_theme_u32(
                theme.search.width,
                default_theme.search.width,
                legacy.search_width,
            ),
        ),
        padding: clamp_u32(
            schema,
            "search_padding",
            use_theme_u32(
                theme.search.padding,
                default_theme.search.padding,
                legacy.search_padding,
            ),
        ),
    };

    let shortcuts = ThemeShortcutsSettings {
        bg_color: normalize_hex_color(
            use_theme_string(
                theme.shortcuts.bg_color,
                &default_theme.shortcuts.bg_color,
                &legacy.shortcuts_bg_color,
            ),
            default_theme.shortcuts.bg_color.clone(),
        ),
        bg_opacity: clamp_u32(
            schema,
            "shortcuts_bg_opacity",
            use_theme_u32(
                theme.shortcuts.bg_opacity,
                default_theme.shortcuts.bg_opacity,
                legacy.shortcuts_bg_opacity,
            ),
        ),
        border_radius: clamp_u32(
            schema,
            "shortcuts_border_radius",
            use_theme_u32(
                theme.shortcuts.border_radius,
                default_theme.shortcuts.border_radius,
                legacy.shortcuts_border_radius,
            ),
        ),
        columns: normalize_enum(
            schema,
            "shortcuts_columns",
            use_theme_string(
                theme.shortcuts.columns,
                &default_theme.shortcuts.columns,
                &legacy.shortcuts_columns,
            ),
            default_theme.shortcuts.columns.clone(),
        ),
        gap: clamp_u32(
            schema,
            "shortcuts_gap",
            use_theme_u32(
                theme.shortcuts.gap,
                default_theme.shortcuts.gap,
                legacy.shortcuts_gap,
            ),
        ),
        border_width: clamp_u32(
            schema,
            "shortcuts_border_width",
            use_theme_u32(
                theme.shortcuts.border_width,
                default_theme.shortcuts.border_width,
                legacy.shortcuts_border_width,
            ),
        ),
        border_color: normalize_hex_color(
            use_theme_string(
                theme.shortcuts.border_color,
                &default_theme.shortcuts.border_color,
                &legacy.shortcuts_border_color,
            ),
            default_theme.shortcuts.border_color.clone(),
        ),
        border_style: normalize_enum(
            schema,
            "shortcuts_border_style",
            use_theme_string(
                theme.shortcuts.border_style,
                &default_theme.shortcuts.border_style,
                &legacy.shortcuts_border_style,
            ),
            default_theme.shortcuts.border_style.clone(),
        ),
        shadow_color: normalize_hex_color(
            use_theme_string(
                theme.shortcuts.shadow_color,
                &default_theme.shortcuts.shadow_color,
                &legacy.shortcuts_shadow_color,
            ),
            default_theme.shortcuts.shadow_color.clone(),
        ),
        shadow_blur: clamp_u32(
            schema,
            "shortcuts_shadow_blur",
            use_theme_u32(
                theme.shortcuts.shadow_blur,
                default_theme.shortcuts.shadow_blur,
                legacy.shortcuts_shadow_blur,
            ),
        ),
        shadow_opacity: clamp_u32(
            schema,
            "shortcuts_shadow_opacity",
            use_theme_u32(
                theme.shortcuts.shadow_opacity,
                default_theme.shortcuts.shadow_opacity,
                legacy.shortcuts_shadow_opacity,
            ),
        ),
        backdrop_blur: clamp_u32(
            schema,
            "shortcuts_backdrop_blur",
            use_theme_u32(
                theme.shortcuts.backdrop_blur,
                default_theme.shortcuts.backdrop_blur,
                legacy.shortcuts_backdrop_blur,
            ),
        ),
        title_color: normalize_hex_color(
            use_theme_string(
                theme.shortcuts.title_color,
                &default_theme.shortcuts.title_color,
                &legacy.shortcuts_title_color,
            ),
            default_theme.shortcuts.title_color.clone(),
        ),
        icon_size: clamp_u32(
            schema,
            "shortcuts_icon_size",
            use_theme_u32(
                theme.shortcuts.icon_size,
                default_theme.shortcuts.icon_size,
                legacy.shortcuts_icon_size,
            ),
        ),
        padding_x: clamp_u32(
            schema,
            "shortcuts_padding_x",
            use_theme_u32(
                theme.shortcuts.padding_x,
                default_theme.shortcuts.padding_x,
                legacy.shortcuts_padding_x,
            ),
        ),
        padding_y: clamp_u32(
            schema,
            "shortcuts_padding_y",
            use_theme_u32(
                theme.shortcuts.padding_y,
                default_theme.shortcuts.padding_y,
                legacy.shortcuts_padding_y,
            ),
        ),
        shape: normalize_enum(
            schema,
            "shortcuts_shape",
            use_theme_string(
                theme.shortcuts.shape,
                &default_theme.shortcuts.shape,
                &legacy.shortcuts_shape,
            ),
            default_theme.shortcuts.shape.clone(),
        ),
    };

    ThemeSettings {
        background,
        clock,
        search,
        shortcuts,
    }
}

fn position_is_default(position: &ElementPosition, default_position: &ElementPosition) -> bool {
    (position.x - default_position.x).abs() < f64::EPSILON
        && (position.y - default_position.y).abs() < f64::EPSILON
}

fn use_layout_position(
    value: ElementPosition,
    default_value: &ElementPosition,
    legacy: &ElementPosition,
) -> ElementPosition {
    if position_is_default(&value, default_value) {
        legacy.clone()
    } else {
        value
    }
}

fn normalize_layout_settings(
    layout: LayoutSettings,
    legacy: &BrowserSettings,
    defaults: &BrowserSettings,
) -> LayoutSettings {
    LayoutSettings {
        clock_position: normalize_position(
            use_layout_position(
                layout.clock_position,
                &defaults.layout.clock_position,
                &legacy.clock_position,
            ),
            defaults.layout.clock_position.clone(),
        ),
        search_position: normalize_position(
            use_layout_position(
                layout.search_position,
                &defaults.layout.search_position,
                &legacy.search_position,
            ),
            defaults.layout.search_position.clone(),
        ),
        shortcuts_position: normalize_position(
            use_layout_position(
                layout.shortcuts_position,
                &defaults.layout.shortcuts_position,
                &legacy.shortcuts_position,
            ),
            defaults.layout.shortcuts_position.clone(),
        ),
    }
}

fn mirror_theme_to_legacy_fields(settings: &mut BrowserSettings) {
    settings.background_color = settings.theme.background.color.clone();
    settings.background_fit = settings.theme.background.fit.clone();
    settings.background_blur = settings.theme.background.blur;
    settings.background_brightness = settings.theme.background.brightness;
    settings.overlay_color = settings.theme.background.overlay_color.clone();
    settings.overlay_opacity = settings.theme.background.overlay_opacity;

    settings.clock_color = settings.theme.clock.color.clone();
    settings.clock_size = settings.theme.clock.size;
    settings.clock_format_24h = settings.theme.clock.format_24h;
    settings.clock_show_seconds = settings.theme.clock.show_seconds;
    settings.clock_show_date = settings.theme.clock.show_date;
    settings.clock_font_weight = settings.theme.clock.font_weight.clone();
    settings.clock_font_family = settings.theme.clock.font_family.clone();
    settings.clock_shadow_color = settings.theme.clock.shadow_color.clone();
    settings.clock_shadow_blur = settings.theme.clock.shadow_blur;
    settings.clock_shadow_opacity = settings.theme.clock.shadow_opacity;
    settings.clock_letter_spacing = settings.theme.clock.letter_spacing;

    settings.search_engine = settings.theme.search.engine.clone();
    settings.search_bg_color = settings.theme.search.bg_color.clone();
    settings.search_bg_opacity = settings.theme.search.bg_opacity;
    settings.search_border_radius = settings.theme.search.border_radius;
    settings.search_placeholder = settings.theme.search.placeholder.clone();
    settings.search_border_width = settings.theme.search.border_width;
    settings.search_border_color = settings.theme.search.border_color.clone();
    settings.search_border_style = settings.theme.search.border_style.clone();
    settings.search_shadow_color = settings.theme.search.shadow_color.clone();
    settings.search_shadow_blur = settings.theme.search.shadow_blur;
    settings.search_shadow_opacity = settings.theme.search.shadow_opacity;
    settings.search_backdrop_blur = settings.theme.search.backdrop_blur;
    settings.search_text_color = settings.theme.search.text_color.clone();
    settings.search_width = settings.theme.search.width;
    settings.search_padding = settings.theme.search.padding;

    settings.shortcuts_bg_color = settings.theme.shortcuts.bg_color.clone();
    settings.shortcuts_bg_opacity = settings.theme.shortcuts.bg_opacity;
    settings.shortcuts_border_radius = settings.theme.shortcuts.border_radius;
    settings.shortcuts_columns = settings.theme.shortcuts.columns.clone();
    settings.shortcuts_gap = settings.theme.shortcuts.gap;
    settings.shortcuts_border_width = settings.theme.shortcuts.border_width;
    settings.shortcuts_border_color = settings.theme.shortcuts.border_color.clone();
    settings.shortcuts_border_style = settings.theme.shortcuts.border_style.clone();
    settings.shortcuts_shadow_color = settings.theme.shortcuts.shadow_color.clone();
    settings.shortcuts_shadow_blur = settings.theme.shortcuts.shadow_blur;
    settings.shortcuts_shadow_opacity = settings.theme.shortcuts.shadow_opacity;
    settings.shortcuts_backdrop_blur = settings.theme.shortcuts.backdrop_blur;
    settings.shortcuts_title_color = settings.theme.shortcuts.title_color.clone();
    settings.shortcuts_icon_size = settings.theme.shortcuts.icon_size;
    settings.shortcuts_padding_x = settings.theme.shortcuts.padding_x;
    settings.shortcuts_padding_y = settings.theme.shortcuts.padding_y;
    settings.shortcuts_shape = settings.theme.shortcuts.shape.clone();
}

fn mirror_layout_to_legacy_fields(settings: &mut BrowserSettings) {
    settings.clock_position = settings.layout.clock_position.clone();
    settings.search_position = settings.layout.search_position.clone();
    settings.shortcuts_position = settings.layout.shortcuts_position.clone();
}

fn clamp_u32(schema: &SharedConfigSchema, key: &str, value: u32) -> u32 {
    let rule = schema
        .numbers
        .get(key)
        .unwrap_or_else(|| panic!("missing numeric config schema for {key}"));
    (value as f64).clamp(rule.min, rule.max) as u32
}

fn clamp_i32(schema: &SharedConfigSchema, key: &str, value: i32) -> i32 {
    let rule = schema
        .numbers
        .get(key)
        .unwrap_or_else(|| panic!("missing numeric config schema for {key}"));
    (value as f64).clamp(rule.min, rule.max) as i32
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

fn normalize_enum(
    schema: &SharedConfigSchema,
    key: &str,
    value: String,
    fallback: String,
) -> String {
    let lowered = value.trim().to_ascii_lowercase();
    let allowed = schema
        .enums
        .get(key)
        .unwrap_or_else(|| panic!("missing enum config schema for {key}"));
    if allowed.iter().any(|allowed| allowed == &lowered) {
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

fn normalize_shortcut_link(shortcut: Shortcut) -> Option<Shortcut> {
    let title = shortcut.title.trim().to_string();
    let url = shortcut.url.and_then(normalize_optional_text)?;
    let icon = shortcut.icon.trim().to_string();

    if title.is_empty() {
        return None;
    }

    Some(Shortcut {
        kind: ShortcutKind::Link,
        title,
        url: Some(url),
        icon: if icon.is_empty() {
            "🔗".to_string()
        } else {
            icon
        },
        position: shortcut
            .position
            .map(|position| normalize_position(position, ElementPosition { x: 50.0, y: 68.0 })),
        children: Vec::new(),
    })
}

fn normalize_shortcut_folder(shortcut: Shortcut) -> Option<Shortcut> {
    let title = shortcut.title.trim().to_string();
    let icon = shortcut.icon.trim().to_string();

    if title.is_empty() {
        return None;
    }

    let children: Vec<Shortcut> = shortcut
        .children
        .into_iter()
        .filter_map(normalize_shortcut_link)
        .take(16)
        .collect();

    if children.is_empty() {
        return None;
    }

    Some(Shortcut {
        kind: ShortcutKind::Folder,
        title,
        url: None,
        icon: if icon.is_empty() {
            "📁".to_string()
        } else {
            icon
        },
        position: shortcut
            .position
            .map(|position| normalize_position(position, ElementPosition { x: 50.0, y: 68.0 })),
        children,
    })
}

fn normalize_shortcut(shortcut: Shortcut) -> Option<Shortcut> {
    match shortcut.kind {
        ShortcutKind::Folder => normalize_shortcut_folder(shortcut),
        ShortcutKind::Link => normalize_shortcut_link(shortcut),
    }
}

fn normalize_shortcuts(shortcuts: Vec<Shortcut>, fallback: &[Shortcut]) -> Vec<Shortcut> {
    let normalized: Vec<Shortcut> = shortcuts
        .into_iter()
        .filter_map(normalize_shortcut)
        .take(16)
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

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn normalizes_legacy_links_and_folder_shortcuts() {
        let settings = serde_json::from_value::<BrowserSettings>(json!({
            "background_image": null,
            "shortcuts": [
                { "title": " GitHub ", "url": " https://github.com ", "icon": "" },
                {
                    "kind": "folder",
                    "title": " Dev ",
                    "icon": "D",
                    "children": [
                        { "title": " Docs ", "url": " https://docs.example.com ", "icon": "" },
                        { "kind": "folder", "title": " Nested ", "icon": "N", "children": [] }
                    ]
                }
            ]
        }))
        .unwrap()
        .normalized();

        assert_eq!(settings.shortcuts[0].kind, ShortcutKind::Link);
        assert_eq!(settings.shortcuts[0].title, "GitHub");
        assert_eq!(
            settings.shortcuts[0].url.as_deref(),
            Some("https://github.com")
        );
        assert_eq!(settings.shortcuts[0].icon, "🔗");
        assert_eq!(settings.shortcuts[1].kind, ShortcutKind::Folder);
        assert_eq!(settings.shortcuts[1].title, "Dev");
        assert_eq!(settings.shortcuts[1].children.len(), 1);
        assert_eq!(settings.shortcuts[1].children[0].title, "Docs");
    }

    #[test]
    fn limits_shortcut_folders_to_sixteen_items() {
        let children: Vec<_> = (0..20)
            .map(|index| {
                json!({
                    "title": format!("Link {index}"),
                    "url": format!("https://example.com/{index}"),
                    "icon": "L"
                })
            })
            .collect();

        let settings = serde_json::from_value::<BrowserSettings>(json!({
            "background_image": null,
            "shortcuts": [
                { "kind": "folder", "title": "Full", "icon": "F", "children": children }
            ]
        }))
        .unwrap()
        .normalized();

        assert_eq!(settings.shortcuts.len(), 1);
        assert_eq!(settings.shortcuts[0].children.len(), 16);
    }

    #[test]
    fn normalizes_v3_theme_and_layout_into_legacy_fields() {
        let settings = serde_json::from_value::<BrowserSettings>(json!({
            "background_image": null,
            "theme": {
                "background": {
                    "color": "#112233",
                    "fit": "contain",
                    "blur": 999,
                    "brightness": 80,
                    "overlay_color": "#445566",
                    "overlay_opacity": 45,
                    "gradient_enabled": true,
                    "gradient_from": "#010203",
                    "gradient_to": "#abcdef",
                    "gradient_direction": "to-right"
                },
                "clock": {
                    "color": "#fedcba",
                    "size": 96
                },
                "search": {
                    "width": 640,
                    "border_radius": 18
                },
                "shortcuts": {
                    "columns": "4",
                    "gap": 20
                }
            },
            "layout": {
                "clock_position": { "x": 25, "y": 35 },
                "search_position": { "x": 50, "y": 55 },
                "shortcuts_position": { "x": 75, "y": 65 }
            }
        }))
        .unwrap()
        .normalized();

        assert_eq!(settings.background_color, "#112233");
        assert_eq!(settings.background_fit, "contain");
        assert_eq!(settings.background_blur, 20);
        assert_eq!(settings.overlay_color, "#445566");
        assert_eq!(settings.overlay_opacity, 45);
        assert_eq!(settings.clock_color, "#fedcba");
        assert_eq!(settings.clock_size, 96);
        assert_eq!(settings.search_width, 640);
        assert_eq!(settings.search_border_radius, 18);
        assert_eq!(settings.shortcuts_columns, "4");
        assert_eq!(settings.shortcuts_gap, 20);
        assert_eq!(settings.clock_position.x, 25.0);
        assert_eq!(settings.search_position.y, 55.0);
        assert!(settings.theme.background.gradient_enabled);
        assert_eq!(settings.theme.background.gradient_direction, "to-right");
    }
}
