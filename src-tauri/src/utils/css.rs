use crate::core::config::BrowserSettings;

pub struct CssGenerator;

fn escape_css_url(path: &str) -> String {
    path.replace('\\', "/")
        .replace('\'', "\\'")
        .replace('"', "\\\"")
        .replace('(', "\\(")
        .replace(')', "\\)")
}

fn hex_to_rgba(hex: &str, opacity: f64) -> String {
    let cleaned = hex.trim().trim_start_matches('#');
    if cleaned.len() != 6 || !cleaned.chars().all(|ch| ch.is_ascii_hexdigit()) {
        return format!("rgba(0, 0, 0, {:.2})", opacity);
    }

    let red = u8::from_str_radix(&cleaned[0..2], 16).unwrap_or(0);
    let green = u8::from_str_radix(&cleaned[2..4], 16).unwrap_or(0);
    let blue = u8::from_str_radix(&cleaned[4..6], 16).unwrap_or(0);

    format!("rgba({}, {}, {}, {:.2})", red, green, blue, opacity)
}

impl CssGenerator {
    pub fn generate_user_content_css(settings: &BrowserSettings) -> String {
        let has_bg_image = settings.background_image.is_some();
        let bg_url = settings
            .background_image
            .as_deref()
            .map(escape_css_url)
            .unwrap_or_default();

        let overlay_alpha = settings.overlay_opacity as f64 / 100.0;
        let search_display = if settings.show_search_box { "flex" } else { "none" };
        let shortcuts_display = if settings.show_shortcuts { "block" } else { "none" };
        let overlay_color = hex_to_rgba(&settings.overlay_color, overlay_alpha);

        let bg_size = match settings.background_fit.as_str() {
            "contain" => "contain",
            "center" => "auto",
            "stretch" => "100% 100%",
            _ => "cover", // "cover" or any unknown value
        };

        let background_css = if has_bg_image {
            format!(
                "background-image: url(\"{bg_url}\") !important;\n        background-size: {bg_size} !important;\n        background-position: center !important;\n        background-repeat: no-repeat !important;\n        background-attachment: fixed !important;",
                bg_url = bg_url,
                bg_size = bg_size,
            )
        } else {
            format!(
                "background: {bg_color} !important;",
                bg_color = settings.background_color,
            )
        };

        let filter_css = if settings.background_blur > 0 || settings.background_brightness != 100 {
            format!(
                "\n        filter: blur({blur}px) brightness({brightness}%) !important;\n        transform: scale(1.05) !important;",
                blur = settings.background_blur,
                brightness = settings.background_brightness,
            )
        } else {
            String::new()
        };

        format!(
            r#"/* BrowserBgSwap - Firefox New Tab Customization */
@-moz-document url("about:newtab"), url("about:home") {{

    /* 主容器背景 */
    .outer-wrapper {{
        position: relative !important;
        isolation: isolate !important;
        background: transparent !important;
    }}

    /* 独立背景层，避免滤镜影响前景 */
    .outer-wrapper::after {{
        content: "" !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: -2 !important;
        {background_css}{filter_css}
    }}

    /* 背景遮罩层 */
    .outer-wrapper::before {{
        content: "" !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: {overlay_color} !important;
        z-index: -1 !important;
    }}

    /* 搜索框 */
    .search-wrapper {{
        display: {search_display} !important;
    }}

    /* 搜索框样式优化 */
    .search-inner-wrapper {{
        background: rgba(255, 255, 255, 0.9) !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    }}

    /* 快捷方式/最近访问 */
    .top-sites-list {{
        display: {shortcuts_display} !important;
    }}

    /* 快捷方式卡片样式 */
    .top-site-outer {{
        background: rgba(255, 255, 255, 0.85) !important;
        border-radius: 12px !important;
        backdrop-filter: blur(10px) !important;
        transition: transform 0.2s, box-shadow 0.2s !important;
    }}

    .top-site-outer:hover {{
        transform: translateY(-4px) !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }}

    /* 文字颜色调整 */
    .section-title span {{
        color: #fff !important;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5) !important;
    }}

    /* Logo区域 */
    .logo-and-wordmark {{
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)) !important;
    }}

    /* 设置按钮 */
    .personalize-button {{
        background: rgba(255, 255, 255, 0.9) !important;
        border-radius: 50% !important;
    }}
}}
"#,
            background_css = background_css,
            filter_css = filter_css,
            overlay_color = overlay_color,
            search_display = search_display,
            shortcuts_display = shortcuts_display,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::config::BrowserSettings;

    #[test]
    fn firefox_background_filter_is_applied_on_background_layer_only() {
        let mut settings = BrowserSettings::default();
        settings.background_blur = 8;
        settings.background_brightness = 120;
        settings.overlay_color = "#123456".into();

        let css = CssGenerator::generate_user_content_css(&settings);

        assert!(css.contains(".outer-wrapper::after"));
        assert!(css.contains("filter: blur(8px) brightness(120%)"));
        assert!(css.contains("background: rgba(18, 52, 86, 0.30)"));
    }
}
