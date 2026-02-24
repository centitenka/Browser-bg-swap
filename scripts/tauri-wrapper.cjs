#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// 添加 cargo 到 PATH
const cargoPath = 'C:\\Users\\10272\\.cargo\\bin';
const currentPath = process.env.PATH || process.env.Path || '';

// Windows 使用分号分隔 PATH
process.env.PATH = `${cargoPath};${currentPath}`;
process.env.Path = process.env.PATH;

// 获取传递给脚本的参数
const args = process.argv.slice(2);

console.log('Running: tauri', args.join(' '));

const tauri = spawn('npx', ['tauri', ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..'),
  env: process.env
});

tauri.on('exit', (code) => {
  process.exit(code);
});

tauri.on('error', (err) => {
  console.error('Failed to start tauri:', err);
  process.exit(1);
});
