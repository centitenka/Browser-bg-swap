pub mod browsers;
pub mod commands;
pub mod core;
pub mod utils;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // Firefox commands
            detect_firefox,
            apply_firefox_settings,
            check_firefox_prerequisites,
            auto_fix_firefox_prerequisites,
            backup_firefox,
            restore_firefox,
            list_firefox_backups,
            // Chrome commands
            generate_chrome_extension,
            get_chrome_install_guide,
            // Common commands
            select_image,
            save_app_config,
            load_app_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
