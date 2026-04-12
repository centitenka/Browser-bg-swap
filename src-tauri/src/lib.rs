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
            delete_firefox_backup,
            // Chrome/Edge commands
            detect_chrome,
            apply_chrome_settings,
            remove_chrome_settings,
            // Common commands
            select_image,
            save_app_config,
            load_app_config,
            open_folder,
            get_downloads_dir,
            export_settings,
            import_settings,
            save_cropped_image,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
