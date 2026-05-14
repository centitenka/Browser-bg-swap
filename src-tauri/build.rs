fn main() {
    println!("cargo:rerun-if-changed=../src/shared/configSchema.json");
    write_shared_config_constants();
    tauri_build::build()
}

fn write_shared_config_constants() {
    let schema = std::fs::read_to_string("../src/shared/configSchema.json")
        .expect("shared configSchema.json must be readable");
    let version = schema
        .lines()
        .find_map(|line| {
            let trimmed = line.trim();
            trimmed
                .strip_prefix("\"configVersion\":")
                .and_then(|value| value.trim_end_matches(',').trim().parse::<u32>().ok())
        })
        .expect("shared configSchema.json must contain configVersion");

    let out_dir = std::env::var("OUT_DIR").expect("OUT_DIR must be set");
    std::fs::write(
        std::path::Path::new(&out_dir).join("config_schema.rs"),
        format!("pub const CONFIG_VERSION: u32 = {version};\n"),
    )
    .expect("generated config_schema.rs must be writable");
}
