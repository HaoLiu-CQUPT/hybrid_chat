# Hybrid 聊天应用

一个基于 WebView/Lynx 的混合聊天应用，支持 WebSocket 实时通信、媒体文件发送、群聊等功能。

## 项目结构

```
hybrid_chat/
├── frontend/          # 前端 Web 应用
│   ├── index.html    # 主页面
│   ├── app.js        # 前端逻辑
│   ├── styles.css    # 样式文件
│   └── package.json  # 前端依赖
├── server/            # Node.js WebSocket 服务器
│   ├── index.js      # 服务器主文件
│   ├── database.js   # 数据库操作
│   ├── package.json  # 服务器依赖
│   └── chat.db       # SQLite 数据库（自动生成）
└── android/           # Android 原生应用
    └── app/          # Android 应用代码
```

## 功能特性

### 基本功能
- ✅ WebSocket 实时通信
- ✅ 用户身份标识（ID）
- ✅ 聊天历史显示
- ✅ 原生方法桥接（设备信息、权限、推送）

### 进阶功能
- ✅ 媒体文件发送（音频/视频/图片）
- ✅ 多人群聊
- ✅ 聊天历史懒加载
- ✅ 持久化存储
- ✅ 消息状态、表情符号、搜索等创意功能

## 快速开始

### Windows 用户
双击运行 `start.bat` 文件即可自动启动所有服务。

### Linux/Mac 用户
```bash
chmod +x start.sh
./start.sh
```

### 手动启动

#### 1. 启动服务器
```bash
cd server
npm install
npm start
```

#### 2. 运行前端
打开新的终端窗口：
```bash
cd frontend
npm install
npm start
```

#### 3. 运行 Android 应用
使用 Android Studio 打开 `android` 目录并运行。

详细说明请查看 [QUICKSTART.md](QUICKSTART.md) 和 [USAGE.md](USAGE.md)

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+), Socket.io Client
- **服务器**: Node.js, Express, Socket.io, SQLite3
- **Android**: Kotlin, WebView, JavaScriptInterface

## 功能详情

### 基本功能
1. **实时通信**: 使用 WebSocket 实现消息的实时发送和接收
2. **用户管理**: 通过用户 ID 标识用户，支持自定义用户名
3. **房间系统**: 支持创建多个聊天房间，用户可以切换房间

### 进阶功能
1. **媒体发送**: 支持发送音频、视频和图片文件
2. **群聊**: 多人同时在线聊天，实时显示在线用户列表
3. **懒加载**: 聊天历史滚动加载，优化性能
4. **持久化**: 使用 SQLite 数据库存储所有聊天记录
5. **搜索**: 快速搜索历史消息
6. **表情**: 丰富的表情符号支持
7. **已读状态**: 显示消息的已读人数

### Android 原生功能
- 获取设备信息
- 权限管理（麦克风、相机、存储）
- 原生通知
- 设备音量控制
- 振动反馈
- 网络状态检测

## 许可证

ISC