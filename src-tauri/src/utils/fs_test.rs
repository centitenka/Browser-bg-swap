use super::fs::write_atomic_string;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

fn unique_temp_file(name: &str) -> PathBuf {
    let unique = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    std::env::temp_dir().join(format!("browser_bg_swap_{name}_{unique}.txt"))
}

#[test]
fn atomic_write_replaces_existing_file_contents() {
    let path = unique_temp_file("atomic");
    fs::write(&path, "old").unwrap();

    write_atomic_string(&path, "new").unwrap();

    assert_eq!(fs::read_to_string(&path).unwrap(), "new");
    fs::remove_file(path).unwrap();
}
