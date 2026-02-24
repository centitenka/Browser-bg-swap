use crate::core::config::BrowserSettings;

pub struct CssGenerator;

impl CssGenerator {
    pub fn generate_user_content_css(settings: &BrowserSettings) -> String {
        let bg_url = settings
            .background_image
            .as_deref()
            .unwrap_or("")
            .replace('\\', "/");

        let search_display = if settings.show_search_box { "flex" } else { "none" };
        let shortcuts_display = if settings.show_shortcuts { "block" } else { "none" };

        format!(
            r#"/* BrowserBgSwap - Firefox New Tab Customization */
@-moz-document url("about:newtab"), url("about:home") {{

    /* 主容器背景 */
    .outer-wrapper {{
        background-image: url("{bg_url}") !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        background-attachment: fixed !important;
    }}

    /* 背景遮罩层 */
    .outer-wrapper::before {{
        content: "" !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.3) !important;
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
            bg_url = bg_url,
            search_display = search_display,
            shortcuts_display = shortcuts_display,
        )
    }
}
