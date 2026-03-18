use crate::core::config::BrowserSettings;
use crate::core::error::{AppError, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChromeDetectResult {
    pub chrome_installed: bool,
    pub edge_installed: bool,
    pub extension_exists: bool,
    pub extension_path: String,
}

pub struct ChromeManager;

impl ChromeManager {
    /// Convert a hex color string to (r, g, b) tuple
    fn hex_to_rgb(hex: &str) -> (u8, u8, u8) {
        let hex = hex.trim_start_matches('#');
        let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(255);
        let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(255);
        let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(255);
        (r, g, b)
    }

    /// Persistent extension directory
    fn get_extension_dir() -> Result<PathBuf> {
        let dir = dirs::data_dir()
            .ok_or(AppError::Io("无法获取数据目录".into()))?
            .join("BrowserBgSwap")
            .join("Extension");
        Ok(dir)
    }

    /// Detect Chrome/Edge installations and extension status
    pub fn detect() -> Result<ChromeDetectResult> {
        let ext_dir = Self::get_extension_dir()?;
        let extension_exists = ext_dir.join("manifest.json").exists();

        Ok(ChromeDetectResult {
            chrome_installed: Self::is_chrome_installed(),
            edge_installed: Self::is_edge_installed(),
            extension_exists,
            extension_path: ext_dir.to_string_lossy().to_string(),
        })
    }

    /// Generate / update extension files
    pub fn apply(
        settings: &BrowserSettings,
        image_path: Option<&str>,
    ) -> Result<String> {
        let ext_dir = Self::get_extension_dir()?;

        if ext_dir.exists() {
            fs::remove_dir_all(&ext_dir)?;
        }
        fs::create_dir_all(&ext_dir)?;
        fs::create_dir_all(ext_dir.join("icons"))?;
        fs::create_dir_all(ext_dir.join("images"))?;

        let bg_file_name = image_path.and_then(Self::background_file_name);

        if let (Some(img), Some(ref name)) = (image_path, &bg_file_name) {
            fs::copy(img, ext_dir.join("images").join(name))?;
        }

        fs::write(ext_dir.join("manifest.json"), Self::generate_manifest())?;
        fs::write(
            ext_dir.join("newtab.html"),
            Self::generate_html(settings, bg_file_name.as_deref()),
        )?;
        fs::write(ext_dir.join("styles.css"), Self::generate_css(settings))?;
        fs::write(ext_dir.join("newtab.js"), Self::generate_js(settings))?;
        Self::create_default_icons(&ext_dir.join("icons"))?;

        Ok(ext_dir.to_string_lossy().to_string())
    }

    /// Remove extension files
    pub fn remove() -> Result<()> {
        let ext_dir = Self::get_extension_dir()?;
        if ext_dir.exists() {
            fs::remove_dir_all(&ext_dir)?;
        }
        Ok(())
    }

    /// Open the extensions page in the specified browser
    pub fn open_extensions_page(browser: &str) -> Result<()> {
        let (exe, url) = match browser {
            "chrome" => (Self::find_chrome_exe(), "chrome://extensions"),
            "edge" => (Self::find_edge_exe(), "edge://extensions"),
            _ => return Err(AppError::Io("不支持的浏览器".into())),
        };

        let exe = exe.ok_or(AppError::Io(format!(
            "未找到{}可执行文件",
            if browser == "chrome" { "Chrome" } else { "Edge" }
        )))?;

        std::process::Command::new(exe)
            .arg(url)
            .spawn()
            .map_err(|e| AppError::Io(format!("无法启动浏览器: {}", e)))?;

        Ok(())
    }

    // ── Browser detection ──────────────────────────────────────────

    fn find_chrome_exe() -> Option<PathBuf> {
        let candidates = vec![
            std::env::var("PROGRAMFILES")
                .ok()
                .map(|p| PathBuf::from(p).join("Google\\Chrome\\Application\\chrome.exe")),
            std::env::var("PROGRAMFILES(X86)")
                .ok()
                .map(|p| PathBuf::from(p).join("Google\\Chrome\\Application\\chrome.exe")),
            std::env::var("LOCALAPPDATA")
                .ok()
                .map(|p| PathBuf::from(p).join("Google\\Chrome\\Application\\chrome.exe")),
        ];
        candidates
            .into_iter()
            .flatten()
            .find(|p| p.exists())
    }

    fn find_edge_exe() -> Option<PathBuf> {
        let candidates = vec![
            std::env::var("PROGRAMFILES(X86)")
                .ok()
                .map(|p| PathBuf::from(p).join("Microsoft\\Edge\\Application\\msedge.exe")),
            std::env::var("PROGRAMFILES")
                .ok()
                .map(|p| PathBuf::from(p).join("Microsoft\\Edge\\Application\\msedge.exe")),
        ];
        candidates
            .into_iter()
            .flatten()
            .find(|p| p.exists())
    }

    fn is_chrome_installed() -> bool {
        Self::find_chrome_exe().is_some()
    }

    fn is_edge_installed() -> bool {
        Self::find_edge_exe().is_some()
    }

    // ── File generation ────────────────────────────────────────────

    fn background_file_name(image_path: &str) -> Option<String> {
        Path::new(image_path)
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| format!("background.{}", e.to_ascii_lowercase()))
    }

    fn generate_manifest() -> String {
        serde_json::json!({
            "manifest_version": 3,
            "name": "BrowserBgSwap - 新标签页自定义",
            "version": "1.0.0",
            "description": "自定义新标签页背景图片和样式",
            "chrome_url_overrides": {
                "newtab": "newtab.html"
            },
            "icons": {
                "16": "icons/icon16.png",
                "48": "icons/icon48.png",
                "128": "icons/icon128.png"
            },
            "web_accessible_resources": [
                {
                    "resources": ["images/*"],
                    "matches": ["<all_urls>"]
                }
            ]
        })
        .to_string()
    }

    fn generate_html(settings: &BrowserSettings, bg_file_name: Option<&str>) -> String {
        let bg_size = match settings.background_fit.as_str() {
            "contain" => "contain",
            "center" => "auto",
            "stretch" => "100% 100%",
            _ => "cover", // "cover" and default
        };

        let bg_style = match bg_file_name {
            Some(name) => format!(
                "background-image: url('images/{name}'); background-size: {bg_size}; background-position: center; background-repeat: no-repeat;"
            ),
            None => format!("background: {};", settings.background_color),
        };

        let filter_style = format!(
            "filter: blur({}px) brightness({}%);",
            settings.background_blur, settings.background_brightness
        );

        let overlay_alpha = settings.overlay_opacity as f64 / 100.0;
        let (ov_r, ov_g, ov_b) = Self::hex_to_rgb(&settings.overlay_color);

        let (search_action, search_param) = match settings.search_engine.as_str() {
            "bing" => ("https://www.bing.com/search", "q"),
            "baidu" => ("https://www.baidu.com/s", "wd"),
            "duckduckgo" => ("https://duckduckgo.com/", "q"),
            _ => ("https://www.google.com/search", "q"),
        };

        let shortcuts_json = serde_json::to_string(&settings.shortcuts).unwrap_or_else(|_| "[]".into());

        let cp = &settings.clock_position;
        let sp = &settings.search_position;
        let shp = &settings.shortcuts_position;

        let clock_weight = match settings.clock_font_weight.as_str() {
            "bold" => "700",
            "normal" => "400",
            _ => "300", // "light" and default
        };

        let (search_r, search_g, search_b) = Self::hex_to_rgb(&settings.search_bg_color);
        let search_bg_alpha = settings.search_bg_opacity as f64 / 100.0;

        let (sc_r, sc_g, sc_b) = Self::hex_to_rgb(&settings.shortcuts_bg_color);
        let sc_bg_alpha = settings.shortcuts_bg_opacity as f64 / 100.0;

        let clock_date_div = if settings.clock_show_date {
            "\n    <div id=\"clock-date\"></div>"
        } else {
            ""
        };

        let custom_css = &settings.custom_css;

        let shortcuts_vis = if settings.show_shortcuts {
            "".to_string()
        } else {
            "#shortcuts { display: none !important; }".to_string()
        };

        format!(
            r#"<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新标签页</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .overlay {{ background: rgba({ov_r},{ov_g},{ov_b},{overlay_alpha:.2}) !important; }}
        .clock {{ color: {clock_color}; font-size: {clock_size}px; font-weight: {clock_weight}; left: {cx:.1}%; top: {cy:.1}%; {clock_vis} }}
        .search-wrap {{ left: {sx:.1}%; top: {sy:.1}%; {search_vis} }}
        .search-wrap form {{ background: rgba({search_r},{search_g},{search_b},{search_bg_alpha:.2}); border-radius: {search_border_radius}px; }}
        .shortcut-item {{ background: rgba({sc_r},{sc_g},{sc_b},{sc_bg_alpha:.2}); border-radius: {shortcuts_border_radius}px; }}
        {shortcuts_vis}
        {custom_css}
    </style>
</head>
<body>
    <div class="background" style="{bg_style} {filter_style}">
        <div class="overlay"></div>
    </div>

    <div class="clock" id="clock"></div>{clock_date_div}

    <div class="search-wrap">
        <form action="{search_action}" method="GET">
            <input type="text" name="{search_param}" placeholder="{search_placeholder}" autofocus>
            <button type="submit">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
        </form>
    </div>

    <div class="shortcuts-wrap" id="shortcuts"></div>

    <script>
        var SHORTCUTS = {shortcuts_json};
        var SHORTCUTS_POSITION = {{ x: {shx:.1}, y: {shy:.1} }};
        var CLOCK_CONFIG = {{ format24h: {clock_format_24h}, showSeconds: {clock_show_seconds}, showDate: {clock_show_date} }};
    </script>
    <script src="newtab.js"></script>
</body>
</html>"#,
            overlay_alpha = overlay_alpha,
            ov_r = ov_r, ov_g = ov_g, ov_b = ov_b,
            clock_color = settings.clock_color,
            clock_size = settings.clock_size,
            clock_weight = clock_weight,
            cx = cp.x, cy = cp.y,
            sx = sp.x, sy = sp.y,
            shx = shp.x, shy = shp.y,
            clock_vis = if settings.show_clock { "" } else { "display:none;" },
            search_vis = if settings.show_search_box { "" } else { "display:none;" },
            shortcuts_vis = shortcuts_vis,
            bg_style = bg_style,
            filter_style = filter_style,
            search_action = search_action,
            search_param = search_param,
            search_placeholder = settings.search_placeholder,
            shortcuts_json = shortcuts_json,
            search_r = search_r,
            search_g = search_g,
            search_b = search_b,
            search_bg_alpha = search_bg_alpha,
            search_border_radius = settings.search_border_radius,
            sc_r = sc_r,
            sc_g = sc_g,
            sc_b = sc_b,
            sc_bg_alpha = sc_bg_alpha,
            shortcuts_border_radius = settings.shortcuts_border_radius,
            clock_date_div = clock_date_div,
            custom_css = custom_css,
            clock_format_24h = settings.clock_format_24h,
            clock_show_seconds = settings.clock_show_seconds,
            clock_show_date = settings.clock_show_date,
        )
    }

    fn generate_css(settings: &BrowserSettings) -> String {
        let (sc_r, sc_g, sc_b) = Self::hex_to_rgb(&settings.shortcuts_bg_color);
        let sc_bg_alpha = settings.shortcuts_bg_opacity as f64 / 100.0;

        let (search_r, search_g, search_b) = Self::hex_to_rgb(&settings.search_bg_color);
        let search_bg_alpha = settings.search_bg_opacity as f64 / 100.0;

        let (ss_r, ss_g, ss_b) = Self::hex_to_rgb(&settings.search_shadow_color);
        let ss_alpha = settings.search_shadow_opacity as f64 / 100.0;

        let (scs_r, scs_g, scs_b) = Self::hex_to_rgb(&settings.shortcuts_shadow_color);
        let scs_alpha = settings.shortcuts_shadow_opacity as f64 / 100.0;

        let (cs_r, cs_g, cs_b) = Self::hex_to_rgb(&settings.clock_shadow_color);
        let cs_alpha = settings.clock_shadow_opacity as f64 / 100.0;

        let search_border = if settings.search_border_style != "none" {
            format!("border: {}px {} {};", settings.search_border_width, settings.search_border_style, settings.search_border_color)
        } else { String::new() };

        let search_backdrop = if settings.search_backdrop_blur > 0 {
            format!("backdrop-filter: blur({}px);", settings.search_backdrop_blur)
        } else { String::new() };

        let sc_border = if settings.shortcuts_border_style != "none" {
            format!("border: {}px {} {};", settings.shortcuts_border_width, settings.shortcuts_border_style, settings.shortcuts_border_color)
        } else { String::new() };

        let sc_backdrop = if settings.shortcuts_backdrop_blur > 0 {
            format!("backdrop-filter: blur({}px);", settings.shortcuts_backdrop_blur)
        } else { String::new() };

        let sc_shape = match settings.shortcuts_shape.as_str() {
            "circle" => "border-radius: 50%; aspect-ratio: 1;".to_string(),
            "square" => format!("border-radius: {}px; aspect-ratio: 1;", settings.shortcuts_border_radius),
            _ => format!("border-radius: {}px;", settings.shortcuts_border_radius),
        };

        let clock_font = match settings.clock_font_family.as_str() {
            "serif" => "font-family: Georgia, 'Times New Roman', serif;",
            "mono" => "font-family: 'Courier New', monospace;",
            _ => "",
        };

        format!(
            r#"* {{ margin: 0; padding: 0; box-sizing: border-box; }}

body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 100vh;
    overflow: hidden;
}}

.background {{
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -2;
}}

.overlay {{
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.3); z-index: -1;
}}

.clock {{
    position: absolute;
    transform: translate(-50%, -50%);
    font-weight: 300;
    text-shadow: 0 2px {cs_blur}px rgba({cs_r},{cs_g},{cs_b},{cs_alpha:.2});
    letter-spacing: {clock_letter_spacing}px;
    {clock_font}
    z-index: 1;
    white-space: nowrap;
}}

#clock-date {{
    position: absolute;
    transform: translate(-50%, 0);
    color: inherit;
    font-size: 0.3em;
    text-shadow: 0 2px {cs_blur}px rgba({cs_r},{cs_g},{cs_b},{cs_alpha:.2});
    z-index: 1;
    white-space: nowrap;
    text-align: center;
}}

.search-wrap {{
    position: absolute;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: {search_width}px;
    z-index: 1;
}}

.search-wrap form {{
    display: flex;
    background: rgba({search_r},{search_g},{search_b},{search_bg_alpha:.2});
    border-radius: {search_border_radius}px;
    padding: {search_padding}px;
    box-shadow: 0 4px {ss_blur}px rgba({ss_r},{ss_g},{ss_b},{ss_alpha:.2});
    {search_border}
    {search_backdrop}
}}

.search-wrap input {{
    flex: 1; border: none; background: transparent;
    padding: 14px 20px; font-size: 16px; outline: none;
    color: {search_text_color};
}}

.search-wrap button {{
    background: #4285f4; color: white; border: none;
    padding: 12px 20px; border-radius: 24px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
}}

.search-wrap button:hover {{ background: #3367d6; }}

.shortcuts-wrap {{
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    z-index: 1; pointer-events: none;
}}

.shortcut-item {{
    position: absolute;
    pointer-events: auto;
    background: rgba({sc_r},{sc_g},{sc_b},{sc_bg_alpha:.2});
    {sc_shape}
    padding: {sc_pad_y}px {sc_pad_x}px;
    text-align: center; cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px {scs_blur}px rgba({scs_r},{scs_g},{scs_b},{scs_alpha:.2});
    {sc_border}
    {sc_backdrop}
}}

.shortcut-item:hover {{
    transform: translate(-50%, -50%) translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}}

.shortcut-icon {{
    width: {icon_size}px; height: {icon_size}px; margin: 0 auto 6px;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    background: #f0f0f0; font-size: 18px;
}}

.shortcut-icon img {{
    width: {icon_size}px; height: {icon_size}px; border-radius: 8px; object-fit: contain;
}}

.shortcut-title {{
    color: {sc_title_color}; font-size: 11px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}}
"#,
            search_r = search_r, search_g = search_g, search_b = search_b,
            search_bg_alpha = search_bg_alpha,
            search_border_radius = settings.search_border_radius,
            search_padding = settings.search_padding,
            search_width = settings.search_width,
            search_border = search_border,
            search_backdrop = search_backdrop,
            search_text_color = settings.search_text_color,
            ss_r = ss_r, ss_g = ss_g, ss_b = ss_b, ss_alpha = ss_alpha,
            ss_blur = settings.search_shadow_blur,
            sc_r = sc_r, sc_g = sc_g, sc_b = sc_b, sc_bg_alpha = sc_bg_alpha,
            sc_shape = sc_shape,
            sc_pad_y = settings.shortcuts_padding_y,
            sc_pad_x = settings.shortcuts_padding_x,
            sc_border = sc_border,
            sc_backdrop = sc_backdrop,
            scs_r = scs_r, scs_g = scs_g, scs_b = scs_b, scs_alpha = scs_alpha,
            scs_blur = settings.shortcuts_shadow_blur,
            icon_size = settings.shortcuts_icon_size,
            sc_title_color = settings.shortcuts_title_color,
            cs_r = cs_r, cs_g = cs_g, cs_b = cs_b, cs_alpha = cs_alpha,
            cs_blur = settings.clock_shadow_blur,
            clock_letter_spacing = settings.clock_letter_spacing,
            clock_font = clock_font,
        )
    }

    fn generate_js(settings: &BrowserSettings) -> String {
        let format_24h = settings.clock_format_24h;
        let show_seconds = settings.clock_show_seconds;
        let show_date = settings.clock_show_date;

        format!(
            r#"// Clock
function updateClock() {{
    var cfg = (typeof CLOCK_CONFIG !== 'undefined') ? CLOCK_CONFIG : {{ format24h: {format_24h}, showSeconds: {show_seconds}, showDate: {show_date} }};
    var now = new Date();
    var h = now.getHours();
    var m = String(now.getMinutes()).padStart(2,'0');
    var timeStr = '';
    if (cfg.format24h) {{
        timeStr = String(h).padStart(2,'0') + ':' + m;
    }} else {{
        var suffix = h >= 12 ? ' PM' : ' AM';
        var h12 = h % 12 || 12;
        timeStr = String(h12) + ':' + m;
        if (cfg.showSeconds) {{
            timeStr += ':' + String(now.getSeconds()).padStart(2,'0');
        }}
        timeStr += suffix;
    }}
    if (cfg.format24h && cfg.showSeconds) {{
        timeStr += ':' + String(now.getSeconds()).padStart(2,'0');
    }}
    var el = document.getElementById('clock');
    if (el) el.textContent = timeStr;

    if (cfg.showDate) {{
        var dateEl = document.getElementById('clock-date');
        if (dateEl) {{
            var y = now.getFullYear();
            var mo = String(now.getMonth() + 1).padStart(2,'0');
            var d = String(now.getDate()).padStart(2,'0');
            dateEl.textContent = y + '-' + mo + '-' + d;
        }}
    }}
}}
setInterval(updateClock, 1000);
updateClock();

// Shortcuts
(function() {{
    var container = document.getElementById('shortcuts');
    if (!container) return;
    var list = (typeof SHORTCUTS !== 'undefined' && SHORTCUTS.length) ? SHORTCUTS : [];
    var defaultPos = (typeof SHORTCUTS_POSITION !== 'undefined') ? SHORTCUTS_POSITION : {{ x: 50, y: 68 }};
    var perRow = 6;
    var hSpacing = 8;
    var vSpacing = 10;

    function getDomain(url) {{
        try {{
            return new URL(url).hostname;
        }} catch(e) {{
            return '';
        }}
    }}

    list.forEach(function(s, i) {{
        var div = document.createElement('div');
        div.className = 'shortcut-item';
        div.addEventListener('click', function() {{ window.location.href = s.url; }});

        // Determine position
        var pos;
        if (s.position) {{
            pos = s.position;
        }} else {{
            var total = list.length;
            var row = Math.floor(i / perRow);
            var col = i % perRow;
            var itemsInRow = Math.min(perRow, total - row * perRow);
            var startX = defaultPos.x - (itemsInRow - 1) * hSpacing / 2;
            var startY = defaultPos.y - (Math.ceil(total / perRow) - 1) * vSpacing / 2;
            pos = {{ x: startX + col * hSpacing, y: startY + row * vSpacing }};
        }}

        div.style.position = 'absolute';
        div.style.left = pos.x + '%';
        div.style.top = pos.y + '%';
        div.style.transform = 'translate(-50%, -50%)';

        var iconDiv = document.createElement('div');
        iconDiv.className = 'shortcut-icon';

        var domain = getDomain(s.url);
        if (domain) {{
            var img = document.createElement('img');
            img.src = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=64';
            img.onerror = function() {{
                iconDiv.removeChild(img);
                iconDiv.textContent = s.icon;
            }};
            iconDiv.appendChild(img);
        }} else {{
            iconDiv.textContent = s.icon;
        }}

        var titleDiv = document.createElement('div');
        titleDiv.className = 'shortcut-title';
        titleDiv.textContent = s.title;
        div.appendChild(iconDiv);
        div.appendChild(titleDiv);
        container.appendChild(div);
    }});
}})();
"#,
            format_24h = format_24h,
            show_seconds = show_seconds,
            show_date = show_date,
        )
    }

    fn create_default_icons(icons_dir: &Path) -> Result<()> {
        // Minimal valid 1x1 pixel transparent PNG
        let minimal_png: Vec<u8> = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0x60, 0x60, 0x60, 0x60,
            0x00, 0x00, 0x00, 0x05, 0x00, 0x01, 0x62, 0xF5,
            0x6A, 0xCE, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
        ];

        for name in &["icon16.png", "icon48.png", "icon128.png"] {
            fs::write(icons_dir.join(name), &minimal_png)?;
        }

        Ok(())
    }
}
