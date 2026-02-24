use crate::browsers::ChromeExtensionBuilder;
use crate::core::config::BrowserSettings;
use crate::core::error::Result;

#[tauri::command]
pub async fn generate_chrome_extension(
    output_path: String,
    settings: BrowserSettings,
    image_path: Option<String>,
) -> Result<String> {
    ChromeExtensionBuilder::build_extension(
        &output_path,
        &settings,
        image_path.as_deref(),
    )
}

#[tauri::command]
pub async fn get_chrome_install_guide() -> String {
    r#"Chrome/Edge扩展安装步骤：

1. 打开Chrome/Edge浏览器
2. 在地址栏输入 chrome://extensions/（Chrome）或 edge://extensions/（Edge）
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择生成的 BrowserBgSwap_Extension 文件夹
6. 扩展安装完成，打开新标签页查看效果

注意：如果背景图片未显示，请确保图片路径正确。"#
        .to_string()
}
