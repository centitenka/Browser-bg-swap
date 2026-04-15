<div align="center">
  <img src="src-tauri/icons/128x128.png" alt="BrowserBgSwap Logo" width="120" height="120" />
  <h1>BrowserBgSwap</h1>
  <p><strong>✨ A Windows desktop tool built mainly for personal use, focused on quickly customizing Firefox / Chrome / Edge new-tab backgrounds and styling. ✨</strong></p>

  <p>
    <a href="README.md"><b>🇨🇳 中文版</b></a> •
    <a href="README.en.md"><b>🇬🇧 English Version</b></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Platform Windows">
    <img src="https://img.shields.io/badge/Tauri-2.0-24C8DB?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Rust-1.70+-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust">
    <img src="https://img.shields.io/badge/status-Personal%20Use-3B82F6?style=for-the-badge" alt="Personal Use">
  </p>
</div>

<br/>

## 📑 Table of Contents

- [✨ Features](#-features)
- [🖥️ System Requirements](#-system-requirements)
- [🚀 Installation](#-installation)
- [📖 Usage Guide](#-usage-guide)
  - [🦊 Firefox Setup](#-firefox-setup)
  - [🌐 Chrome/Edge Setup](#-chromeedge-setup)
- [🎨 UI Preview](#-ui-preview)
- [🛠️ Tech Stack](#-tech-stack)
- [❓ FAQ](#-faq)
- [👨‍💻 Development Guide](#-development-guide)
- [📝 Changelog](#-changelog)

---

## ✨ Features

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>🦊 Firefox Support</h3>
      <ul>
        <li>🔍 Auto-detect profiles</li>
        <li>🖼️ Background image or solid color setup</li>
        <li>🎛️ Fit, blur, brightness, and overlay controls</li>
        <li>👁️ Toggle search box display</li>
        <li>🔗 Toggle shortcuts/recent visits</li>
        <li>🧠 Smart precondition check</li>
        <li>🔧 Auto-fix configurations</li>
        <li>💾 Profile-scoped backup and restore</li>
      </ul>
    </td>
    <td width="33%" valign="top">
      <h3>🌐 Chrome/Edge Support</h3>
      <ul>
        <li>📦 Generate a persistent Manifest V3 extension</li>
        <li>⚙️ Fully customizable new tab</li>
        <li>⏰ Real-time clock display</li>
        <li>🔎 Integrated Google search box</li>
        <li>🔲 Shortcut grid layout</li>
        <li>📚 Detailed installation guide</li>
      </ul>
    </td>
    <td width="33%" valign="top">
      <h3>🛠️ General Features</h3>
      <ul>
        <li>💻 Modern visual GUI</li>
        <li>👀 Real-time preview</li>
        <li>💾 Auto-save config</li>
        <li>📂 Multi-browser management</li>
        <li>⚡ Lightweight, low resources</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🖥️ System Requirements

- **OS**: Windows 10 / Windows 11
- **Firefox**: Version 60 or above (supports `userContent.css`)
- **Chrome/Edge**: Latest version
- **Runtime**: 📦 **Out-of-the-box**, no extra runtime required

---

## 🚀 Installation

### 🛠️ Build from Source

<details>
<summary><b>Click to expand build steps</b></summary>

#### Prerequisites
- [Rust](https://rustup.rs/) 1.70 or above
- [Node.js](https://nodejs.org/) 18 or above
- Windows SDK

#### Build Steps

```bash
# 1. Enter the project directory
cd browser-bg-swap

# 2. Install frontend dependencies
npm install

# 3. Install Tauri CLI (if not installed)
cargo install tauri-cli

# 4. Run in development mode
npm run tauri:dev

# 5. Build release version
npm run tauri build
```

> 💡 After building, the installer can be found in the `src-tauri/target/release/bundle/msi/` directory.
> 💡 This repository is currently documented as a local-build, personal-use project. There is no maintained public release URL yet.

</details>

---

## 📖 Usage Guide

### 🦊 Firefox Setup

> **Note:** After making changes, you must **completely close and restart Firefox** for the settings to take effect.

1. **Select Profile**: Open the app and switch to the **Firefox** tab. It will auto-detect installed Firefox profiles (usually, select the "default" one).
2. **Check Preconditions**: If prompted to "Configure Firefox", click the **[Auto Configure]** button to let the tool enable the required settings (`toolkit.legacyUserProfileCustomizations.stylesheets`).
3. **Set Background**: Click **[Choose Image]** and select an image from your PC (JPG, PNG, GIF, WebP supported).
4. **Supported Firefox Options**: Firefox currently supports background image or color, fit, blur, brightness, overlay, and search or shortcut visibility toggles.
5. **Apply & Restart**: Click **[Apply Settings]**, then **completely close Firefox** (ensure no firefox.exe in Task Manager), and reopen it.

---

### 🌐 Chrome/Edge Setup

> **Note:** Chrome/Edge customization works by generating a local browser extension stored in a persistent app-data directory by default.

1. **Configure Background**: Switch to the **Chrome/Edge** tab and set the background image and display options.
2. **Generate Extension**: Click **[Save and apply]** to refresh the local extension bundle stored in app data.
3. **Install Extension**:
   - 🔵 **Chrome**: Go to `chrome://extensions/` ➔ Enable **[Developer mode]** (top right) ➔ Click **[Load unpacked]** ➔ Select the generated `BrowserBgSwap_Extension` folder.
   - 🟢 **Edge**: Go to `edge://extensions/` ➔ Enable **[Developer mode]** (bottom left) ➔ Click **[Load unpacked]** ➔ Select the generated `BrowserBgSwap_Extension` folder.

---

## 🎨 UI Preview

```text
┌─────────────────────────────────────────────────────────────┐
│ ✦ BrowserBgSwap                                   [v0.1.0]  │
│   Browser Background Customization Tool                     │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ [Firefox]│  🦊 Firefox Setup                                │
│          │                                                  │
│ [Chrome/ │  ┌────────────────────────────────────────────┐  │
│  Edge]   │  │ 📂 Select Profile                            │  │
│          │  │ ○ default-release • Default                │  │
│          │  │   C:\Users\...\Firefox\Profiles\xxxxx      │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ 🖼️ Background Settings                       │  │
│          │  │ [Choose Image]  D:\Pictures\background.jpg │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ ⚙️ Display Options                           │  │
│          │  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│          │  │ Show Search Box                       [On] │  │
│          │  │ Show Shortcuts/Recent Visits          [On] │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  [🚀 Apply Settings]                              │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **🚀 Core Framework** | Tauri v2 | Cross-platform framework for fast, tiny apps |
| **🦀 Backend (Rust)** | Rust, serde, thiserror, dirs, chrono | High-performance file system & path handling |
| **⚛️ Frontend (UI)** | React 19, TypeScript | Modern, type-safe reactive interface |
| **🎨 Styling & State** | Tailwind CSS, Zustand, Lucide React | Utility-first CSS, lightweight state & icons |
| **📦 Build Tools** | Vite, Cargo | Blazing fast frontend build & Rust package management |

---

<details>
<summary><b>❓ FAQ</b></summary>

### Q: Firefox changes not taking effect?
**A:** Please ensure:
1. Firefox is completely closed (no firefox.exe in Task Manager).
2. `toolkit.legacyUserProfileCustomizations.stylesheets` is set to true (use Auto Configure).
3. Correct profile is selected.

### Q: Background image displays abnormally?
**A:**
- Ensure the image path has no special characters.
- Use images from your local disk (not direct web links).
- Supported formats: JPG, PNG, GIF, WebP, BMP.

### Q: How to restore Firefox default style?
**A:** Two ways:
1. Use the "Restore Backup" feature in the tool.
2. Manually delete the `chrome/userContent.css` file in your Firefox profile directory.

### Q: Chrome extension shows "Cannot load extension icon"?
**A:** This is normal. The generated extension uses placeholder icons which do not affect functionality. To customize, replace the PNG files in the extension's `icons/` folder.

</details>

<details>
<summary><b>👨‍💻 Development Guide</b></summary>

### Project Structure
```text
browser-bg-swap/
├── src-tauri/              # Rust backend code
│   ├── src/
│   │   ├── browsers/       # Browser adapters
│   │   ├── commands/       # Tauri commands
│   │   ├── core/           # Core type definitions
│   │   └── utils/          # Utility functions
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri config
├── src/                    # React frontend code
│   ├── components/         # Components
│   ├── stores/             # State management
│   ├── types/              # TypeScript types
│   └── App.tsx             # App entry
└── package.json            # Node dependencies
```

### Development Commands
```bash
npm run tauri dev      # Start dev mode (hot reload for both frontend and backend)
npm run build          # Build frontend code
npm run tauri build    # Build the full desktop application installer
cd src-tauri && cargo check  # Check Rust code
cd src-tauri && cargo fmt    # Format Rust code
```

### Local Data Directory
```text
%AppData%\BrowserBgSwap\
├── config.json        # app config
├── backups\           # Firefox backups
└── Extension\         # Chrome / Edge extension bundle
```

</details>

<details>
<summary><b>📝 Changelog & Notes</b></summary>

### Notes
- **Platform scope**: The current release is designed and validated as a **Windows desktop tool**.
- **Firefox Config**: Restart Firefox after changing `about:config`. `userContent.css` only affects `about:newtab` and `about:home`.
- **Firefox capability boundary**: Firefox currently implements background and basic visibility controls only; it does not yet match the full Chrome/Edge advanced styling surface.
- **Security**: This tool collects no user data; all operations are local.

### Changelog
#### v0.1.0 (2026-02-24)
- 🎉 Initial release
- ✨ Firefox background customization & auto-setup
- 🧩 Chrome/Edge extension generation
- 🖼️ Visual GUI for ease of use
- 💾 Configuration backup and restore

</details>

---

<div align="center">
  <p>This README currently assumes local builds and personal-use workflows.</p>
  <p>If you plan to publish it, add a real repository URL, release pipeline, and license file first.</p>
  <p><b>Acknowledgements:</b> <a href="https://tauri.app/">Tauri</a> • <a href="https://react.dev/">React</a> • <a href="https://tailwindcss.com/">Tailwind CSS</a></p>
</div>
