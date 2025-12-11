#!/bin/bash

echo "启动 Hybrid Chat 应用..."
echo

# 启动服务器
echo "[1/2] 启动服务器..."
cd server
npm install
npm start &
SERVER_PID=$!
cd ..

sleep 3

# 启动前端
echo "[2/2] 启动前端服务器..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo
echo "服务器已启动！"
echo "- 后端服务器: http://localhost:3000"
echo "- 前端服务器: http://localhost:8080"
echo
echo "按 Ctrl+C 停止所有服务..."

# 等待用户中断
trap "kill $SERVER_PID $FRONTEND_PID; exit" INT
wait


