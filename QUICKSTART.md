# 快速开始指南

## 前提条件

- Node.js (v14 或更高版本)
- npm 或 yarn
- Android Studio (用于 Android 应用)
- Android 设备或模拟器

## 快速启动（Windows）

双击运行 `start.bat` 文件，会自动安装依赖并启动服务器。

## 快速启动（Linux/Mac）

```bash
chmod +x start.sh
./start.sh
```

## 手动启动

### 1. 启动后端服务器

```bash
cd server
npm install
npm start
```

服务器将在 `http://localhost:3000` 运行。

### 2. 启动前端服务器

打开新的终端窗口：

```bash
cd frontend
npm install
npm start
```

前端将在 `http://localhost:8080` 运行。

### 3. 访问应用

在浏览器中打开 `http://localhost:8080`

## Android 应用配置

### 在 Android Studio 中打开项目

1. 打开 Android Studio
2. 选择 "Open an Existing Project"
3. 选择 `android` 目录
4. 等待 Gradle 同步完成

### 配置服务器地址

如果使用真机测试，需要修改服务器地址：

1. 找到电脑的 IP 地址：
   - Windows: 在命令提示符中运行 `ipconfig`
   - Mac/Linux: 在终端中运行 `ifconfig` 或 `ip addr`
   - 找到类似 `192.168.1.xxx` 的地址

2. 修改 `android/app/src/main/java/com/hybridchat/app/MainActivity.kt`:
   ```kotlin
   // 将 10.0.2.2 改为你的电脑 IP 地址
   webView.loadUrl("http://192.168.1.xxx:8080/index.html")
   ```

3. 修改 `android/app/src/main/java/com/hybridchat/app/AndroidBridge.kt`:
   ```kotlin
   fun getServerUrl(): String {
       return "http://192.168.1.xxx:3000"  // 改为你的电脑 IP 地址
   }
   ```

### 运行 Android 应用

1. 连接 Android 设备或启动模拟器
2. 点击 Android Studio 的运行按钮（绿色播放图标）
3. 等待应用安装并启动

## 使用说明

### 加入聊天

1. 在登录界面输入用户 ID（必填）
2. 输入用户名（可选，默认为 "用户+ID"）
3. 输入房间 ID（可选，默认为 "default"）
4. 点击"加入"按钮

### 发送消息

1. 在底部输入框中输入消息
2. 点击"发送"按钮或按 Enter 键发送

### 发送媒体文件

1. 点击媒体按钮（📎图标）
2. 选择音频、视频或图片文件
3. 输入可选的消息文本
4. 点击发送

### 使用表情

1. 点击表情按钮（😀图标）
2. 选择表情符号
3. 表情会自动插入到输入框

### 搜索消息

1. 点击搜索按钮（🔍图标）
2. 输入搜索关键词
3. 点击搜索结果可以跳转到对应消息

### 房间管理

1. 点击房间按钮（👥图标）
2. 查看房间列表
3. 创建新房间或切换到其他房间

## 功能列表

✅ WebSocket 实时通信  
✅ 多人群聊  
✅ 媒体文件发送（音频/视频/图片）  
✅ 聊天历史懒加载  
✅ 持久化存储（SQLite）  
✅ 消息搜索  
✅ 表情符号  
✅ 消息已读状态  
✅ 在线用户列表  
✅ Android 原生功能桥接  
✅ 设备信息获取  
✅ 权限管理  
✅ 原生通知  

## 常见问题

### 服务器连接失败

- 确保服务器正在运行
- 检查防火墙设置
- 确认端口 3000 和 8080 未被占用

### Android 应用无法加载页面

- 检查手机和电脑是否在同一 WiFi 网络
- 确认服务器地址配置正确
- 查看 Android Logcat 日志获取详细错误信息

### 权限请求失败

- Android 6.0+ 需要运行时权限
- 确保在设置中授予应用所需权限

## 下一步

- 实现用户认证
- 添加文件上传到服务器
- 实现端到端加密
- 添加推送通知（FCM）
- 实现语音和视频通话


