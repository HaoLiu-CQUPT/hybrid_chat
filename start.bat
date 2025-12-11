@echo off
echo 启动 Hybrid Chat 应用...
echo.

echo [1/2] 启动服务器...
start "Hybrid Chat Server" cmd /k "cd server && npm install && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务器...
start "Hybrid Chat Frontend" cmd /k "cd frontend && npm install && npm start"

echo.
echo 服务器已启动！
echo - 后端服务器: http://localhost:3000
echo - 前端服务器: http://localhost:8080
echo.
echo 按任意键退出...
pause >nul


