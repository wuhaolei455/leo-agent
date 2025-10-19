#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"

if [[ ! -d "$SERVER_DIR" || ! -d "$CLIENT_DIR" ]]; then
  echo "❌ 未找到 server 或 client 目录，请确认脚本放置在项目根目录。"
  exit 1
fi

install_dependencies() {
  local target_dir="$1"
  local name="$2"

  if [[ ! -d "$target_dir/node_modules" ]]; then
    echo "📦 正在安装 $name 依赖..."
    (cd "$target_dir" && npm install)
  else
    echo "✅ $name 依赖已存在，跳过安装。"
  fi
}

install_dependencies "$SERVER_DIR" "后端"
install_dependencies "$CLIENT_DIR" "前端"

cleanup() {
  echo "\n🛑 接收到退出信号，正在停止进程..."
  trap - INT TERM EXIT
  kill 0 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "🚀 启动 NestJS 服务 (端口 3002)..."
(cd "$SERVER_DIR" && npm run start:dev) &
SERVER_PID=$!

echo "🌐 启动 React 前端 (端口 3000)..."
(cd "$CLIENT_DIR" && npm start) &
CLIENT_PID=$!

wait $SERVER_PID $CLIENT_PID

