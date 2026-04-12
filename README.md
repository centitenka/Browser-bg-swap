<div align="center">
  <img src="src-tauri/icons/128x128.png" alt="BrowserBgSwap Logo" width="120" height="120" />
  <h1>BrowserBgSwap</h1>
  <p><strong>✨ 一款专为 Windows 用户设计的可视化 GUI 工具，轻松自定义浏览器背景图片和主页样式。 ✨</strong></p>

  <p>
    <a href="README.md"><b>中文版</b></a> •
    <a href="README.en.md"><b>English Version</b></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Platform Windows">
    <img src="https://img.shields.io/badge/Tauri-2.0-24C8DB?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/Rust-1.70+-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Rust">
    <img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License">
  </p>
</div>

<br/>

## 📑 目录

- [📑 目录](#-目录)
- [✨ 功能特性](#-功能特性)
- [🖥️ 系统要求](#️-系统要求)
- [🚀 安装方法](#-安装方法)
  - [📦 方法一：下载预编译版本（✨ 推荐 ✨）](#-方法一下载预编译版本-推荐-)
  - [🛠️ 方法二：从源码构建](#️-方法二从源码构建)
    - [环境要求](#环境要求)
    - [构建步骤](#构建步骤)
- [📖 使用指南](#-使用指南)
  - [🦊 Firefox 设置](#-firefox-设置)
  - [🌐 Chrome/Edge 设置](#-chromeedge-设置)
- [🛠️ 技术栈](#️-技术栈)
  - [Q: Firefox 修改后没有生效？](#q-firefox-修改后没有生效)
  - [Q: 背景图片显示异常？](#q-背景图片显示异常)
  - [Q: 如何恢复 Firefox 默认样式？](#q-如何恢复-firefox-默认样式)
  - [Q: Chrome 扩展提示"无法加载扩展程序图标"？](#q-chrome-扩展提示无法加载扩展程序图标)
  - [项目结构](#项目结构)
  - [常用开发命令](#常用开发命令)
  - [注意事项](#注意事项)
  - [更新日志](#更新日志)
    - [v1.0.0 (2026-02-24)](#v100-2026-02-24)

---

## ✨ 功能特性

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>🦊 Firefox 支持</h3>
      <ul>
        <li>🔍 自动检测 Firefox 配置文件</li>
        <li>🖼️ 设置新标签页背景图片或背景色</li>
        <li>🎛️ 调整背景适应方式、模糊、亮度与遮罩</li>
        <li>👁️ 控制搜索框显示/隐藏</li>
        <li>🔗 控制快捷方式/最近访问显示/隐藏</li>
        <li>🧠 智能前置条件检查（about:config）</li>
        <li>🔧 自动修复配置问题</li>
        <li>💾 按 Profile 隔离的备份与恢复功能</li>
      </ul>
    </td>
    <td width="33%" valign="top">
      <h3>🌐 Chrome/Edge 支持</h3>
      <ul>
        <li>📦 生成持久化的 Manifest V3 浏览器扩展</li>
        <li>⚙️ 完全自定义的新标签页</li>
        <li>⏰ 实时时钟显示</li>
        <li>🔎 集成 Google 搜索框</li>
        <li>🔲 快捷方式网格布局</li>
        <li>📚 详细的安装指引</li>
      </ul>
    </td>
    <td width="33%" valign="top">
      <h3>🛠️ 通用功能</h3>
      <ul>
        <li>💻 可视化图形界面</li>
        <li>👀 实时预览效果</li>
        <li>💾 配置自动保存</li>
        <li>📂 多浏览器配置管理</li>
        <li>⚡ 轻量化设计，资源占用低</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🖥️ 系统要求

- **操作系统**: Windows 10 / Windows 11
- **Firefox**: 版本 60 及以上（支持 `userContent.css`）
- **Chrome/Edge**: 最新版本
- **运行时**: 📦 **开箱即用**，无需安装额外运行时

---

## 🚀 安装方法

### 📦 方法一：下载预编译版本（✨ 推荐 ✨）

1. 访问 [Releases](https://github.com/yourusername/browser-bg-swap/releases) 页面
2. 下载最新版本的 `BrowserBgSwap_x.x.x_x64.msi`
3. 双击安装包，按向导完成安装
4. 从开始菜单或桌面快捷方式启动

### 🛠️ 方法二：从源码构建

<details>
<summary><b>点击查看源码构建步骤</b></summary>

#### 环境要求
- [Rust](https://rustup.rs/) 1.70 或更高版本
- [Node.js](https://nodejs.org/) 18 或更高版本
- Windows SDK

#### 构建步骤

```bash
# 1. 克隆仓库
git clone https://github.com/yourusername/browser-bg-swap.git
cd browser-bg-swap

# 2. 安装前端依赖
npm install

# 3. 安装 Tauri CLI (如未安装)
cargo install tauri-cli

# 4. 开发模式运行
cargo tauri dev

# 5. 构建发布版本
cargo tauri build
```

> 💡 构建完成后，安装包将位于 `src-tauri/target/release/bundle/msi/` 目录下。

</details>

---

## 📖 使用指南

### 🦊 Firefox 设置

> **提示：** 修改完成后，必须**完全关闭并重启 Firefox** 才能使设置生效。

1. **选择配置文件**：打开应用后切换到 **Firefox** 选项卡，系统会自动检测已安装的 Firefox 及其配置文件（通常选择标记为“默认”的即可）。
2. **检查前置条件**：如果提示“需要配置 Firefox”，请点击 **[自动配置]** 按钮，工具会自动启用相关设置（`toolkit.legacyUserProfileCustomizations.stylesheets`）。
3. **设置背景图片**：点击 **[选择图片]** 按钮，从本地选择一张喜欢的图片（支持 JPG, PNG, GIF, WebP 等）。
4. **调整受支持的样式项**：Firefox 目前支持背景图/背景色、适应方式、模糊、亮度、遮罩，以及“显示搜索框”“显示快捷方式”。
5. **应用与重启**：点击 **[应用设置]**，然后**完全关闭 Firefox**（确保任务管理器中没有 firefox.exe 进程），重新打开即可看到效果。

---

### 🌐 Chrome/Edge 设置

> **提示：** Chrome/Edge 的修改基于生成本地扩展的方式实现，扩展文件默认保存在应用数据目录下的持久路径中。

1. **配置背景**：切换到 **Chrome/Edge** 选项卡，设置背景图片和显示选项。
2. **生成扩展**：选择一个扩展输出路径（可留空使用默认），点击 **[生成扩展]**。
3. **安装扩展**：
   - 🔵 **Chrome**: 打开 `chrome://extensions/` ➔ 开启右上角 **[开发者模式]** ➔ 点击 **[加载已解压的扩展程序]** ➔ 选择生成的 `BrowserBgSwap_Extension` 文件夹。
   - 🟢 **Edge**: 打开 `edge://extensions/` ➔ 开启左下角 **[开发人员模式]** ➔ 点击 **[加载解压缩的扩展]** ➔ 选择生成的 `BrowserBgSwap_Extension` 文件夹。

---

## 🛠️ 技术栈

| 分类 | 技术 | 说明 |
| :--- | :--- | :--- |
| **🚀 核心框架** | Tauri v2 | 跨平台桌面应用框架，提供高性能与小体积 |
| **🦀 后端 (Rust)** | Rust, serde, thiserror, dirs, chrono | 高性能系统编程，处理文件系统、路径与配置 |
| **⚛️ 前端 (UI)** | React 19, TypeScript | 提供现代化、类型安全的响应式交互界面 |
| **🎨 样式与状态** | Tailwind CSS, Zustand, Lucide React | 原子化 CSS 样式、轻量级状态管理与精美图标 |
| **📦 构建工具** | Vite, Cargo | 极速前端构建与 Rust 依赖管理 |

---

<details>
<summary><b>❓ 常见问题 (FAQ)</b></summary>

### Q: Firefox 修改后没有生效？
**A:** 请确保：
1. 已完全关闭 Firefox（检查任务管理器中没有 firefox.exe 进程）。
2. `toolkit.legacyUserProfileCustomizations.stylesheets` 已设置为 true（可使用软件内的自动配置功能）。
3. 选择了正确的配置文件。

### Q: 背景图片显示异常？
**A:**
- 确保图片路径不包含特殊字符。
- 建议使用本地磁盘上的图片（不要直接使用网络图片链接）。
- 图片格式支持：JPG、PNG、GIF、WebP、BMP。

### Q: 如何恢复 Firefox 默认样式？
**A:** 两种方法：
1. 使用工具中的"恢复备份"功能（如果之前创建过备份）。
2. 手动进入 Firefox 配置文件目录，删除 `chrome/userContent.css` 文件。

### Q: Chrome 扩展提示"无法加载扩展程序图标"？
**A:** 这是正常现象，生成的扩展包含占位图标。扩展功能不受影响。如需自定义图标，可替换扩展目录 `icons/` 下的 PNG 文件。

</details>

<details>
<summary><b>👨‍💻 开发指南</b></summary>

### 项目结构
```text
browser-bg-swap/
├── src-tauri/              # Rust 后端代码
│   ├── src/
│   │   ├── browsers/       # 浏览器适配逻辑
│   │   ├── commands/       # Tauri 命令
│   │   ├── core/           # 核心类型定义
│   │   └── utils/          # 工具函数
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 配置
├── src/                    # React 前端代码
│   ├── components/         # 组件
│   ├── stores/             # 状态管理
│   ├── types/              # TypeScript 类型
│   └── App.tsx             # 应用入口
└── package.json            # Node 依赖配置
```

### 常用开发命令
```bash
npm run tauri dev      # 启动开发模式（前端与后端热重载）
npm run build          # 构建前端代码
npm run tauri build    # 构建完整的桌面应用程序包
cd src-tauri && cargo check  # 检查 Rust 代码
cd src-tauri && cargo fmt    # 格式化 Rust 代码
```

</details>

<details>
<summary><b>📝 更新日志 & 注意事项</b></summary>

### 注意事项
- **平台范围**: 当前版本以 **Windows 桌面工具** 为边界设计和验证。
- **Firefox 配置**: 修改 `about:config` 设置后需要重启 Firefox；`userContent.css` 仅对 `about:newtab` 和 `about:home` 页面生效。
- **Firefox 能力边界**: Firefox 目前只实现背景与基础显隐控制，不包含 Chrome/Edge 新标签页的完整高级样式能力。
- **扩展安全性**: 本工具不会收集任何用户数据，所有操作均在本地完成。

### 更新日志
#### v1.0.0 (2026-02-24)
- 🎉 初始版本发布
- ✨ 支持 Firefox 背景自定义及一键配置
- 🧩 支持 Chrome/Edge 扩展生成
- 🖼️ 可视化 GUI 界面，操作简便
- 💾 配置备份与恢复功能

</details>

---

<div align="center">
  <p>本项目采用 <a href="LICENSE">MIT License</a> 许可证开源。</p>
  <p>欢迎提交 Issue 和 Pull Request！💖</p>
  <p><b>致谢：</b> <a href="https://tauri.app/">Tauri</a> • <a href="https://react.dev/">React</a> • <a href="https://tailwindcss.com/">Tailwind CSS</a></p>
</div>
