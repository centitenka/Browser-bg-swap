use crate::core::error::{AppError, Result};
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};

fn temp_path_for(target: &Path) -> Result<PathBuf> {
    let parent = target
        .parent()
        .ok_or_else(|| AppError::Io("目标路径缺少父目录".into()))?;
    let stem = target
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| AppError::Io("目标文件名无效".into()))?;
    let nonce = format!(
        "{}_{}",
        std::process::id(),
        chrono::Utc::now().timestamp_nanos_opt().unwrap_or_default()
    );

    Ok(parent.join(format!("{stem}.{nonce}.tmp")))
}

pub fn write_atomic(path: &Path, contents: &[u8]) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let temp_path = temp_path_for(path)?;
    let mut file = File::create(&temp_path)?;
    file.write_all(contents)?;
    file.sync_all()?;
    drop(file);

    if path.exists() {
        fs::remove_file(path)?;
    }

    fs::rename(&temp_path, path)?;
    Ok(())
}

pub fn write_atomic_string(path: &Path, contents: &str) -> Result<()> {
    write_atomic(path, contents.as_bytes())
}

pub fn copy_atomic(from: &Path, to: &Path) -> Result<()> {
    let bytes = fs::read(from)?;
    write_atomic(to, &bytes)
}
