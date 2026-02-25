# 📖 [English Version](README.en.md) | [中文版](README.md)

# BrowserBgSwap - Browser Background Customization Tool

A visual GUI tool designed for Windows users to easily customize browser background images and homepage styles.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)
![Tauri](https://img.shields.io/badge/tauri-2.0-blue.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)

---

## Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
  - [Firefox Setup](#firefox-setup)
  - [Chrome/Edge Setup](#chromeedge-setup)
- [UI Preview](#ui-preview)
- [FAQ](#faq)
- [Tech Stack](#tech-stack)
- [Development Guide](#development-guide)
- [Notes](#notes)
- [Changelog](#changelog)

---

## Features

### Firefox Support
- Auto-detect Firefox profiles
- One-click set new tab background image
- Toggle search box display
- Toggle shortcuts/recent visits display
- Smart precondition check (about:config)
- Auto-fix configuration issues
- Backup and restore configuration

### Chrome/Edge Support
- Generate Manifest V3 browser extension
- Fully customizable new tab page
- Real-time clock display
- Integrated Google search box
- Shortcut grid layout
- Detailed installation guide

### General Features
- Visual GUI
- Real-time preview
- Auto-save configuration
- Multi-browser configuration management
- Lightweight design, low resource usage

---

## System Requirements

- **OS**: Windows 10 / Windows 11
- **Firefox**: Version 60 or above (userContent.css supported)
- **Chrome/Edge**: Latest version
- **Runtime**: No extra runtime required

---

## Installation

### Method 1: Download Prebuilt Version (Recommended)

1. Visit the [Releases](https://github.com/yourusername/browser-bg-swap/releases) page
2. Download the latest `BrowserBgSwap_x.x.x_x64.msi`
3. Double-click the installer and follow the wizard
4. Launch from Start Menu or desktop shortcut

### Method 2: Build from Source

#### Prerequisites
- [Rust](https://rustup.rs/) 1.70 or above
- [Node.js](https://nodejs.org/) 18 or above
- Windows SDK

#### Build Steps

```bash
# Clone the repo
git clone https://github.com/yourusername/browser-bg-swap.git
cd browser-bg-swap

# Install frontend dependencies
npm install

# Install Tauri CLI
cargo install tauri-cli

# Run in development mode
cargo tauri dev

# Build release version
cargo tauri build
```

After building, the installer can be found in `src-tauri/target/release/bundle/msi/`.

---

## Usage Guide

### Firefox Setup

#### Step 1: Detect Browser
After opening the app, switch to the **Firefox** tab. The system will auto-detect installed Firefox and its profiles.

#### Step 2: Select Profile
- Choose the Firefox profile to modify from the list
- Usually, select the one marked as "default"

#### Step 3: Check Preconditions
If prompted to "Configure Firefox":

**Option 1: Auto Configure (Recommended)**
Click the "Auto Configure" button to let the tool create the `user.js` file with required settings.

**Option 2: Manual Configure**
1. Enter `about:config` in Firefox address bar
2. Search for `toolkit.legacyUserProfileCustomizations.stylesheets`
3. Set it to `true`
4. Restart Firefox

#### Step 4: Set Background Image
1. Click the "Choose Image" button
2. Select an image from your computer (JPG, PNG, GIF, WebP supported)
3. The image path will be shown below the button

#### Step 5: Configure Display Options
- **Show Search Box**: Toggle new tab search box
- **Show Shortcuts**: Toggle shortcuts/recent visits

#### Step 6: Apply Settings
1. Click the "Apply Settings" button
2. **Completely close Firefox** (ensure no firefox.exe in Task Manager)
3. Reopen Firefox to see the custom background

#### Backup & Restore
- **Create Backup**: Backup current config before changes
- **Restore Backup**: Restore previous config if needed

---

### Chrome/Edge Setup

#### Step 1: Configure Background
Switch to the **Chrome/Edge** tab and set background image and display options.

#### Step 2: Generate Extension
1. Choose extension output path (leave blank for default)
2. Click "Generate Extension"
3. Wait for completion

#### Step 3: Install Extension

**Chrome:**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the generated `BrowserBgSwap_Extension` folder
5. Extension installed, open new tab to see effect

**Edge:**
1. Open Edge and go to `edge://extensions/`
2. Enable "Developer mode" (bottom left)
3. Click "Load unpacked"
4. Select the generated `BrowserBgSwap_Extension` folder
5. Extension installed

#### Uninstall Extension
To restore default new tab:
- Chrome: `chrome://extensions/` → Find BrowserBgSwap → Click "Remove"
- Edge: `edge://extensions/` → Find BrowserBgSwap → Click "Remove"

---

## UI Preview

```
┌─────────────────────────────────────────────────────────────┐
│  BrowserBgSwap                                    [v1.0.0]  │
│  Browser Background Customization Tool                      │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ [Firefox]│  Firefox Setup                                   │
│          │                                                  │
│ [Chrome/ │  ┌────────────────────────────────────────────┐  │
│  Edge]   │  │ Select Profile                             │  │
│          │  │ ○ default-release • Default                │  │
│          │  │   C:\Users\...\Firefox\Profiles\xxxxx      │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ Background Settings                        │  │
│          │  │ [Choose Image]  D:\Pictures\background.jpg │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ Display Options                            │  │
│          │  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│          │  │ Show Search Box                       [On] │  │
│          │  │ Show Shortcuts/Recent Visits          [On] │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  [Apply Settings]                                 │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## FAQ

### Q: Firefox changes not taking effect?
**A:** Please ensure:
1. Firefox is completely closed (no firefox.exe in Task Manager)
2. `toolkit.legacyUserProfileCustomizations.stylesheets` is set to true
3. Correct profile is selected

### Q: Background image displays abnormally?
**A:**
- Ensure image path has no special characters
- Use images from local disk (not direct web links)
- Supported formats: JPG, PNG, GIF, WebP, BMP

### Q: How to restore Firefox default style?
**A:** Two ways:
1. Use "Restore Backup" in the tool (if backup exists)
2. Manually delete `chrome/userContent.css` in the profile directory

### Q: Chrome extension shows "Cannot load extension icon"?
**A:** This is normal. The generated extension uses placeholder icons. Functionality is not affected. To customize, replace PNG files in the `icons/` folder.

### Q: Which browser versions are supported?
**A:**
- Firefox 60+ (userChrome/userContent CSS supported)
- Chrome 88+ (Manifest V3 supported)
- Edge 88+ (Chromium-based)

### Q: Is admin privilege required?
**A:** No. The tool only modifies user directory config files, no admin rights needed.

---

## Tech Stack

### Backend
- **Rust** - High-performance system language
- **Tauri v2** - Cross-platform desktop app framework
- **serde** - JSON serialization/deserialization
- **thiserror** - Error handling
- **dirs** - Cross-platform directory paths
- **chrono** - Date/time handling
- **walkdir** - Directory traversal

### Frontend
- **React 18** - UI component library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Atomic CSS framework
- **Zustand** - Lightweight state management
- **Lucide React** - Icon library

### Build Tools
- **Vite** - Frontend build tool
- **Cargo** - Rust package manager

---

## Development Guide

### Project Structure
```
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
# Install dependencies
npm install

# Development mode (hot reload)
npm run tauri dev

# Build frontend
npm run build

# Build full app
npm run tauri build

# Check Rust code
cd src-tauri && cargo check

# Format Rust code
cd src-tauri && cargo fmt
```

### Adding New Features

1. **Add new Tauri command**
   - Create/modify module in `src-tauri/src/commands/`
   - Register command in `src-tauri/src/lib.rs`

2. **Add frontend component**
   - Create component in `src/components/`
   - Add state logic in `src/stores/configStore.ts`

3. **Add browser support**
   - Implement adapter in `src-tauri/src/browsers/`
   - Follow existing module interface design

---

## Notes

1. **Firefox Configuration**
   - Restart Firefox after changing `about:config`
   - `userContent.css` only affects `about:newtab` and `about:home`
   - Some Firefox themes may conflict with custom CSS

2. **Chrome/Edge Extension**
   - Extension must be loaded in developer mode
   - Extension stays enabled after browser restart
   - Extension does not auto-update; regenerate and reload manually

3. **Image Path**
   - Use absolute paths
   - If image is moved/deleted, background will not display
   - Chrome extension copies image to extension directory

4. **Security**
   - No user data is collected
   - All operations are local
   - Backup before use is recommended

---

## Changelog

### v1.0.0 (2026-02-24)
- Initial release
- Firefox background customization
- Chrome/Edge extension generation
- Visual GUI
- Backup and restore feature

---

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Issues and Pull Requests are welcome!

## Acknowledgements

- [Tauri](https://tauri.app/) - Excellent cross-platform desktop framework
- [React](https://react.dev/) - Powerful UI library
- [Tailwind CSS](https://tailwindcss.com/) - Efficient CSS framework
