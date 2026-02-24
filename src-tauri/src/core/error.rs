use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize)]
pub enum AppError {
    #[error("IO错误: {0}")]
    Io(String),

    #[error("Firefox未安装")]
    FirefoxNotInstalled,

    #[error("Firefox配置文件未找到")]
    ProfileNotFound,

    #[error("CSS写入失败: {0}")]
    CssWriteFailed(String),

    #[error("权限不足: {0}")]
    PermissionDenied(String),

    #[error("备份失败: {0}")]
    BackupFailed(String),

    #[error("配置无效: {0}")]
    InvalidConfig(String),

    #[error("扩展生成失败: {0}")]
    ExtensionGenerationFailed(String),
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::InvalidConfig(e.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
