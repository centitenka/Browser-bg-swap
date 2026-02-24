# BrowserBgSwap - 浏览器背景自定义工具

一款专为 Windows 用户设计的可视化 GUI 工具，让你轻松自定义浏览器背景图片和主页样式。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)
![Tauri](https://img.shields.io/badge/tauri-2.0-blue.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)

---

## 目录

- [功能特性](#功能特性)
- [系统要求](#系统要求)
- [安装方法](#安装方法)
- [使用指南](#使用指南)
  - [Firefox 设置](#firefox-设置)
  - [Chrome/Edge 设置](#chromeedge-设置)
- [界面预览](#界面预览)
- [常见问题](#常见问题)
- [技术栈](#技术栈)
- [开发指南](#开发指南)
- [注意事项](#注意事项)
- [更新日志](#更新日志)

---

## 功能特性

### Firefox 支持
- 自动检测 Firefox 配置文件
- 一键设置新标签页背景图片
- 控制搜索框显示/隐藏
- 控制快捷方式/最近访问显示/隐藏
- 智能前置条件检查（about:config）
- 自动修复配置问题
- 配置备份与恢复功能

### Chrome/Edge 支持
- 生成 Manifest V3 浏览器扩展
- 完全自定义的新标签页
- 实时时钟显示
- 集成 Google 搜索框
- 快捷方式网格布局
- 详细的安装指引

### 通用功能
- 可视化图形界面
- 实时预览效果
- 配置自动保存
- 多浏览器配置管理
- 轻量化设计，资源占用低

---

## 系统要求

- **操作系统**: Windows 10 / Windows 11
- **Firefox**: 版本 60 及以上（支持 userContent.css）
- **Chrome/Edge**: 最新版本
- **运行时**: 无需安装额外运行时

---

## 安装方法

### 方法一：下载预编译版本（推荐）

1. 访问 [Releases](https://github.com/yourusername/browser-bg-swap/releases) 页面
2. 下载最新版本的 `BrowserBgSwap_x.x.x_x64.msi`
3. 双击安装包，按向导完成安装
4. 从开始菜单或桌面快捷方式启动

### 方法二：从源码构建

#### 环境要求
- [Rust](https://rustup.rs/) 1.70 或更高版本
- [Node.js](https://nodejs.org/) 18 或更高版本
- Windows SDK

#### 构建步骤

```bash
# 克隆仓库
git clone https://github.com/yourusername/browser-bg-swap.git
cd browser-bg-swap

# 安装前端依赖
npm install

# 安装 Tauri CLI
cargo install tauri-cli

# 开发模式运行
cargo tauri dev

# 构建发布版本
cargo tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/msi/` 目录下。

---

## 使用指南

### Firefox 设置

#### 第一步：检测浏览器
打开应用后，切换到 **Firefox** 选项卡，系统会自动检测已安装的 Firefox 及其配置文件。

#### 第二步：选择配置文件
- 从列表中选择要修改的 Firefox 配置文件
- 通常选择标记为"默认"的配置文件即可

#### 第三步：检查前置条件
如果显示"需要配置 Firefox"的提示，你可以选择：

**方式一：自动配置（推荐）**
点击"自动配置"按钮，工具会自动创建 `user.js` 文件启用必要的设置。

**方式二：手动配置**
1. 在 Firefox 地址栏输入 `about:config`
2. 搜索 `toolkit.legacyUserProfileCustomizations.stylesheets`
3. 将其设置为 `true`
4. 重启 Firefox

#### 第四步：设置背景图片
1. 点击"选择图片"按钮
2. 从本地选择一张喜欢的图片（支持 JPG、PNG、GIF、WebP 格式）
3. 图片路径会显示在按钮下方

#### 第五步：配置显示选项
- **显示搜索框**：控制新标签页搜索框的显示/隐藏
- **显示快捷方式**：控制最近访问网站快捷方式的显示/隐藏

#### 第六步：应用设置
1. 点击"应用设置"按钮
2. **完全关闭 Firefox**（确保所有窗口都已关闭）
3. 重新打开 Firefox，新标签页将显示自定义背景

#### 备份与恢复
- **创建备份**：在修改前创建当前配置的备份
- **恢复备份**：如果对新样式不满意，可以恢复到之前的配置

---

### Chrome/Edge 设置

#### 第一步：配置背景
切换到 **Chrome/Edge** 选项卡，设置背景图片和显示选项。

#### 第二步：生成扩展
1. 选择扩展输出路径（留空则使用默认位置）
2. 点击"生成扩展"按钮
3. 等待生成完成

#### 第三步：安装扩展

**Chrome 浏览器：**
1. 打开 Chrome，地址栏输入 `chrome://extensions/`
2. 开启右上角的"**开发者模式**"
3. 点击"**加载已解压的扩展程序**"
4. 选择生成的 `BrowserBgSwap_Extension` 文件夹
5. 扩展安装完成，打开新标签页查看效果

**Edge 浏览器：**
1. 打开 Edge，地址栏输入 `edge://extensions/`
2. 开启左下角的"**开发人员模式**"
3. 点击"**加载解压缩的扩展**"
4. 选择生成的 `BrowserBgSwap_Extension` 文件夹
5. 扩展安装完成

#### 卸载扩展
如需恢复默认新标签页：
- Chrome：`chrome://extensions/` → 找到 BrowserBgSwap → 点击"移除"
- Edge：`edge://extensions/` → 找到 BrowserBgSwap → 点击"删除"

---

## 界面预览

```
┌─────────────────────────────────────────────────────────────┐
│  BrowserBgSwap                                    [v1.0.0]  │
│  浏览器背景自定义工具                                       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│ [Firefox]│  Firefox 设置                                    │
│          │                                                  │
│ [Chrome/ │  ┌────────────────────────────────────────────┐  │
│  Edge]   │  │ 选择配置文件                                 │  │
│          │  │ ○ default-release • 默认                    │  │
│          │  │   C:\Users\...\Firefox\Profiles\xxxxx      │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ 背景设置                                     │  │
│          │  │ [选择图片]  D:\Pictures\background.jpg       │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐  │
│          │  │ 显示选项                                     │  │
│          │  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│          │  │ 显示搜索框                              [开] │  │
│          │  │ 显示快捷方式/最近访问                     [开] │  │
│          │  └────────────────────────────────────────────┘  │
│          │                                                  │
│          │  [应用设置]                                      │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 常见问题

### Q: Firefox 修改后没有生效？
**A:** 请确保：
1. 已完全关闭 Firefox（检查任务管理器中没有 firefox.exe 进程）
2. `toolkit.legacyUserProfileCustomizations.stylesheets` 已设置为 true
3. 选择了正确的配置文件

### Q: 背景图片显示异常？
**A:**
- 确保图片路径不包含特殊字符
- 建议使用本地磁盘上的图片（不要直接使用网络图片链接）
- 图片格式支持：JPG、PNG、GIF、WebP、BMP

### Q: 如何恢复 Firefox 默认样式？
**A:** 两种方法：
1. 使用工具中的"恢复备份"功能（如果之前创建过备份）
2. 手动删除配置文件目录下的 `chrome/userContent.css` 文件

### Q: Chrome 扩展提示"无法加载扩展程序图标"？
**A:** 这是正常现象，生成的扩展包含占位图标。扩展功能不受影响。如需自定义图标，可替换扩展目录 `icons/` 下的 PNG 文件。

### Q: 支持哪些浏览器版本？
**A:**
- Firefox 60+（支持 userChrome/userContent CSS）
- Chrome 88+（Manifest V3 支持）
- Edge 88+（基于 Chromium 的版本）

### Q: 是否需要管理员权限？
**A:** 不需要。工具只修改用户目录下的配置文件，不需要系统管理员权限。

---

## 技术栈

### 后端
- **Rust** - 高性能系统编程语言
- **Tauri v2** - 跨平台桌面应用框架
- **serde** - JSON 序列化/反序列化
- **thiserror** - 错误处理
- **dirs** - 跨平台目录路径获取
- **chrono** - 日期时间处理
- **walkdir** - 目录遍历

### 前端
- **React 18** - UI 组件库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 原子化 CSS 框架
- **Zustand** - 轻量级状态管理
- **Lucide React** - 图标库

### 构建工具
- **Vite** - 前端构建工具
- **Cargo** - Rust 包管理器

---

## 开发指南

### 项目结构
```
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

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run tauri dev

# 构建前端
npm run build

# 构建整个应用
npm run tauri build

# 检查 Rust 代码
cd src-tauri && cargo check

# 格式化 Rust 代码
cd src-tauri && cargo fmt
```

### 添加新功能

1. **添加新的 Tauri 命令**
   - 在 `src-tauri/src/commands/` 下创建或修改模块
   - 在 `src-tauri/src/lib.rs` 中注册命令

2. **添加前端组件**
   - 在 `src/components/` 下创建组件
   - 在 `src/stores/configStore.ts` 添加状态管理逻辑

3. **添加浏览器支持**
   - 在 `src-tauri/src/browsers/` 下实现适配器
   - 遵循现有模块的接口设计

---

## 注意事项

1. **Firefox 配置**
   - 修改 `about:config` 设置后需要重启 Firefox
   - `userContent.css` 仅对 `about:newtab` 和 `about:home` 页面生效
   - 某些 Firefox 主题可能会与自定义 CSS 冲突

2. **Chrome/Edge 扩展**
   - 扩展需要在开发者模式下加载
   - 每次重启浏览器后扩展保持启用状态
   - 扩展不会自动更新，需要手动重新生成和加载

3. **图片路径**
   - 建议使用绝对路径
   - 如果图片被移动或删除，背景将失效
   - Chrome 扩展会将图片复制到扩展目录中

4. **安全性**
   - 本工具不会收集任何用户数据
   - 所有操作都在本地完成
   - 建议在使用前创建备份

---

## 更新日志

### v1.0.0 (2026-02-24)
- 初始版本发布
- 支持 Firefox 背景自定义
- 支持 Chrome/Edge 扩展生成
- 可视化 GUI 界面
- 配置备份与恢复功能

---

## 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Tauri](https://tauri.app/) - 优秀的跨平台桌面应用框架
- [React](https://react.dev/) - 强大的 UI 库
- [Tailwind CSS](https://tailwindcss.com/) - 高效的 CSS 框架

