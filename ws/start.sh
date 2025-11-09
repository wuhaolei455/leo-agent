#!/bin/bash

# WebSocket Demo 启动脚本

echo "🚀 启动 WebSocket Demo..."

# 检查 node_modules 是否存在
if [ ! -d "ws-server/node_modules" ]; then
    echo "📦 安装服务器依赖..."
    cd ws-server
    npm install
    cd ..
fi

if [ ! -d "ws-client/node_modules" ]; then
    echo "📦 安装客户端依赖..."
    cd ws-client
    npm install --legacy-peer-deps
    cd ..
fi

echo ""
echo "✨ 启动服务器和客户端..."
echo ""
echo "🔵 服务器将运行在: http://localhost:9000"
echo "🔵 客户端将运行在: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 启动服务器和客户端
trap 'kill $(jobs -p)' EXIT

cd ws-server && npm run start:dev &
cd ws-client && npm start &

wait

