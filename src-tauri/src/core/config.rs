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
        self.search_bg_opacity =
            clamp_u32(&schema, "search_bg_opacity", self.search_bg_opacity);
        self.search_border_radius = clamp_u32(
            &schema,
            "search_border_radius",
            self.search_border_radius,
        );
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
        self.search_shadow_blur =
            clamp_u32(&schema, "search_shadow_blur", self.search_shadow_blur);
        self.search_shadow_opacity = clamp_u32(
            &schema,
            "search_shadow_opacity",
            self.search_shadow_opacity,
        );
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
        self.shortcuts_shadow_blur = clamp_u32(
            &schema,
            "shortcuts_shadow_blur",
            self.shortcuts_shadow_blur,
        );
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
        self.clock_shadow_blur =
            clamp_u32(&schema, "clock_shadow_blur", self.clock_shadow_blur);
        self.clock_shadow_opacity = clamp_u32(
            &schema,
            "clock_shadow_opacity",
            self.clock_shadow_opacity,
        );
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

        self
    }
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

fn normalize_enum(schema: &SharedConfigSchema, key: &str, value: String, fallback: String) -> String {
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
        assert_eq!(settings.shortcuts[0].url.as_deref(), Some("https://github.com"));
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
}
