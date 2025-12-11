# 使用说明

## 项目结构

```
hybrid_chat/
├── frontend/          # 前端 Web 应用
│   ├── index.html    # 主页面
│   ├── app.js        # 前端逻辑
│   ├── styles.css    # 样式文件
│   └── package.json  # 前端依赖
├── server/            # Node.js 服务器
│   ├── index.js      # 服务器主文件
│   ├── database.js   # 数据库操作
│   ├── package.json  # 服务器依赖
│   └── chat.db       # SQLite 数据库（自动生成）
└── android/           # Android 应用
    └── app/          # Android 应用代码
```

## 快速开始

### 1. 安装服务器依赖

```bash
cd server
npm install
```

### 2. 启动服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 运行。

### 3. 安装前端依赖并启动

打开新的终端窗口：

```bash
cd frontend
npm install
npm start
```

前端将在 `http://localhost:8080` 运行。

### 4. 访问 Web 应用

在浏览器中打开 `http://localhost:8080`

### 5. 运行 Android 应用

#### 方式一：使用 Android Studio

1. 打开 Android Studio
2. 选择 "Open an Existing Project"
3. 选择 `android` 目录
4. 等待 Gradle 同步完成
5. 连接 Android 设备或启动模拟器
6. 点击运行按钮

#### 方式二：使用命令行

```bash
cd android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 6. 配置 Android 应用

**重要**：如果 Android 应用需要连接到本地服务器：

- **Android 模拟器**：使用 `http://10.0.2.2:3000`（已在代码中配置）
- **真机设备**：
  1. 确保手机和电脑在同一 WiFi 网络
  2. 找到电脑的 IP 地址（例如：192.168.1.100）
  3. 修改 `MainActivity.kt` 中的 `getServerUrl()` 方法，返回实际 IP 地址
  4. 修改 `MainActivity.kt` 中的 `webView.loadUrl()` 为实际的服务器地址

## 功能说明

### 基本功能

1. **用户登录**：输入用户 ID 和用户名（可选）加入聊天
2. **实时消息**：使用 WebSocket 实现实时消息发送和接收
3. **多房间支持**：可以创建和切换不同的聊天房间
4. **在线用户列表**：查看当前房间的在线用户

### 进阶功能

1. **媒体文件发送**：
   - 点击媒体按钮选择音频、视频或图片文件
   - 支持本地文件上传和发送

2. **群聊功能**：
   - 多个用户可以同时在一个房间聊天
   - 实时显示在线用户数量

3. **懒加载**：
   - 滚动到顶部自动加载更多历史消息
   - 优化性能和用户体验

4. **持久化存储**：
   - 使用 SQLite 数据库存储所有聊天记录
   - 重新加入房间后可以查看历史消息

5. **创意功能**：
   - 表情符号支持
   - 消息搜索功能
   - 消息已读状态显示
   - 原生通知（Android）
   - 设备信息获取（Android）
   - 权限管理（Android）

### Android 原生功能

通过 `AndroidBridge` 类，WebView 可以调用以下原生方法：

- `getDeviceInfo()` - 获取设备信息
- `getServerUrl()` - 获取服务器地址
- `hasMicrophonePermission()` - 检查麦克风权限
- `hasCameraPermission()` - 检查相机权限
- `hasStoragePermission()` - 检查存储权限
- `isNetworkAvailable()` - 检查网络连接
- `showNotification()` - 显示原生通知
- `sendAppMessage()` - 发送应用内消息
- `getDeviceVolume()` - 获取设备音量
- `setDeviceVolume()` - 设置设备音量
- `vibrate()` - 振动设备

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+), Socket.io Client
- **后端**：Node.js, Express, Socket.io, SQLite3
- **Android**：Kotlin, WebView, JavaScriptInterface

## 注意事项

1. 确保服务器在 Android 应用启动前运行
2. Android 应用需要网络权限才能连接服务器
3. 首次运行会创建 SQLite 数据库文件
4. 媒体文件存储在浏览器本地，不会上传到服务器（生产环境需要文件上传服务）
5. 开发环境使用 HTTP，生产环境应使用 HTTPS

## 故障排除

### 服务器连接失败

- 检查服务器是否正在运行
- 检查防火墙设置
- 确认端口 3000 未被占用

### Android 应用无法加载页面

- 检查网络连接
- 确认服务器地址配置正确
- 查看 Android Logcat 日志

### 权限问题

- 确保在 AndroidManifest.xml 中声明了所需权限
- 运行时权限需要用户授权

## 扩展建议

1. 添加用户认证系统
2. 实现文件上传到服务器
3. 添加加密功能
4. 实现推送通知（FCM）
5. 添加语音和视频通话功能
6. 实现消息加密
7. 添加更多主题和个性化设置


