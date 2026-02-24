use crate::core::config::BrowserSettings;
use crate::core::error::Result;
use std::fs;
use std::path::Path;

pub struct ChromeExtensionBuilder;

impl ChromeExtensionBuilder {
    pub fn build_extension(
        output_dir: &str,
        settings: &BrowserSettings,
        image_path: Option<&str>,
    ) -> Result<String> {
        let ext_dir = Path::new(output_dir).join("BrowserBgSwap_Extension");
        if ext_dir.exists() {
            fs::remove_dir_all(&ext_dir)?;
        }
        fs::create_dir_all(&ext_dir)?;

        fs::create_dir_all(ext_dir.join("icons"))?;
        fs::create_dir_all(ext_dir.join("images"))?;

        fs::write(ext_dir.join("manifest.json"), Self::generate_manifest())?;
        fs::write(ext_dir.join("newtab.html"), Self::generate_newtab_html(settings, image_path))?;
        fs::write(ext_dir.join("styles.css"), Self::generate_styles_css())?;
        fs::write(ext_dir.join("newtab.js"), Self::generate_newtab_js())?;

        if let Some(img) = image_path {
            let ext = Path::new(img)
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("jpg");
            let dest = ext_dir.join("images").join(format!("background.{}", ext));
            fs::copy(img, dest)?;
        }

        Self::create_default_icons(&ext_dir.join("icons"))?;

        Ok(ext_dir.to_string_lossy().to_string())
    }

    fn generate_manifest() -> String {
        serde_json::json!({
            "manifest_version": 3,
            "name": "BrowserBgSwap - 新标签页自定义",
            "version": "1.0.0",
            "description": "自定义新标签页背景图片和样式",
            "permissions": ["storage"],
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

    fn generate_newtab_html(settings: &BrowserSettings, image_path: Option<&str>) -> String {
        let bg_style = if image_path.is_some() {
            "background-image: url('images/background.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;".to_string()
        } else {
            "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);".to_string()
        };

        let search_display = if settings.show_search_box { "flex" } else { "none" };
        let shortcuts_display = if settings.show_shortcuts { "grid" } else { "none" };

        format!(
            r#"<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新标签页</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="background" style="{}">
        <div class="overlay"></div>
    </div>

    <div class="container">
        <div class="clock" id="clock"></div>

        <div class="search-box" style="display: {};">
            <form action="https://www.google.com/search" method="GET">
                <input type="text" name="q" placeholder="搜索..." autofocus>
                <button type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
            </form>
        </div>

        <div class="shortcuts" style="display: {};" id="shortcuts">
        </div>
    </div>

    <script src="newtab.js"></script>
</body>
</html>"#,
            bg_style, search_display, shortcuts_display
        )
    }

    fn generate_styles_css() -> &'static str {
        r#"* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 100vh;
    overflow: hidden;
}

.background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: -1;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}

.clock {
    color: white;
    font-size: 72px;
    font-weight: 300;
    margin-bottom: 30px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.search-box {
    width: 100%;
    max-width: 600px;
    margin-bottom: 40px;
}

.search-box form {
    display: flex;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 28px;
    padding: 4px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.search-box input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 14px 20px;
    font-size: 16px;
    outline: none;
}

.search-box button {
    background: #4285f4;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.search-box button:hover {
    background: #3367d6;
}

.shortcuts {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 16px;
    width: 100%;
    max-width: 600px;
}

.shortcut-item {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.shortcut-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

.shortcut-icon {
    width: 40px;
    height: 40px;
    margin: 0 auto 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    font-size: 20px;
}

.shortcut-title {
    color: #333;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
"#
    }

    fn generate_newtab_js() -> &'static str {
        r#"// 时钟功能
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clock = document.getElementById('clock');
    if (clock) {
        clock.textContent = `${hours}:${minutes}`;
    }
}

setInterval(updateClock, 1000);
updateClock();

// 默认快捷方式
const defaultShortcuts = [
    { title: 'GitHub', url: 'https://github.com', icon: '💻' },
    { title: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
    { title: 'Bilibili', url: 'https://bilibili.com', icon: '📺' },
    { title: '知乎', url: 'https://zhihu.com', icon: '❓' },
];

// 渲染快捷方式
function renderShortcuts() {
    const container = document.getElementById('shortcuts');
    if (!container) return;

    chrome.storage.local.get(['shortcuts'], (result) => {
        const shortcuts = result.shortcuts || defaultShortcuts;
        container.innerHTML = shortcuts.map(s => `
            <div class="shortcut-item" onclick="window.open('${s.url}', '_self')">
                <div class="shortcut-icon">${s.icon}</div>
                <div class="shortcut-title">${s.title}</div>
            </div>
        `).join('');
    });
}

renderShortcuts();
"#
    }

    fn create_default_icons(icons_dir: &Path) -> Result<()> {
        let icon16 = vec![137u8, 80, 78, 71, 13, 10, 26, 10];
        fs::write(icons_dir.join("icon16.png"), icon16)?;

        let icon48 = vec![137u8, 80, 78, 71, 13, 10, 26, 10];
        fs::write(icons_dir.join("icon48.png"), icon48)?;

        let icon128 = vec![137u8, 80, 78, 71, 13, 10, 26, 10];
        fs::write(icons_dir.join("icon128.png"), icon128)?;

        Ok(())
    }
}
