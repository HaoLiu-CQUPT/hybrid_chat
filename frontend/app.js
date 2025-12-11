// 全局变量
let socket = null;
let currentUserId = null;
let currentUsername = null;
let currentRoomId = 'default';
let isLoadingMore = false;
let oldestMessageTimestamp = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    
    // 延迟检查 Android Bridge（等待 WebView 注入）
    setTimeout(() => {
        if (typeof AndroidBridge !== 'undefined') {
            setupAndroidBridge();
        }
    }, 500);
});

// 初始化事件监听器
function initializeEventListeners() {
    // 登录
    document.getElementById('joinBtn').addEventListener('click', handleJoin);
    document.getElementById('userIdInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleJoin();
    });

    // 发送消息
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 自动调整文本框高度
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 表情按钮
    document.getElementById('emojiBtn').addEventListener('click', toggleEmojiPicker);
    
    // 表情选择
    document.querySelectorAll('.emoji').forEach(emoji => {
        emoji.addEventListener('click', () => {
            insertEmoji(emoji.textContent);
        });
    });

    // 媒体按钮
    document.getElementById('mediaBtn').addEventListener('click', () => {
        document.getElementById('mediaInput').click();
    });
    document.getElementById('mediaInput').addEventListener('change', handleMediaSelect);

    // 搜索
    document.getElementById('searchBtn').addEventListener('click', toggleSearch);
    document.getElementById('searchCancelBtn').addEventListener('click', toggleSearch);
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // 房间管理
    document.getElementById('roomBtn').addEventListener('click', toggleRoomPanel);
    document.getElementById('roomCancelBtn').addEventListener('click', toggleRoomPanel);
    document.getElementById('createRoomBtn').addEventListener('click', createRoom);

    // 懒加载
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.addEventListener('scroll', handleScroll);
}

// 处理加入聊天
function handleJoin() {
    const userId = document.getElementById('userIdInput').value.trim();
    const username = document.getElementById('usernameInput').value.trim();
    const roomId = document.getElementById('roomIdInput').value.trim() || 'default';

    if (!userId) {
        alert('请输入用户ID');
        return;
    }

    currentUserId = userId;
    currentUsername = username || `用户${userId}`;
    currentRoomId = roomId;

    // 连接 WebSocket
    connectSocket();

    // 隐藏登录面板
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('roomName').textContent = `房间: ${roomId}`;
}

// 连接 WebSocket
function connectSocket() {
    // 如果使用 Android WebView，可以通过原生方法获取服务器地址
    const serverUrl = window.AndroidBridge?.getServerUrl() || 'http://localhost:3000';
    
    socket = io(serverUrl);

    // 加入房间
    socket.emit('join', {
        userId: currentUserId,
        username: currentUsername,
        roomId: currentRoomId
    });

    // 监听消息
    socket.on('message', handleNewMessage);

    // 监听历史消息
    socket.on('history', (messages) => {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        messages.forEach(msg => {
            appendMessage(msg);
        });
        
        // 记录最旧消息的时间戳
        if (messages.length > 0) {
            oldestMessageTimestamp = messages[0].timestamp;
        }
        
        scrollToBottom();
    });

    // 监听更多历史消息（懒加载）
    socket.on('moreHistory', (messages) => {
        if (messages.length > 0) {
            const messagesDiv = document.getElementById('messages');
            const scrollTop = messagesDiv.scrollTop;
            const scrollHeight = messagesDiv.scrollHeight;
            
            messages.forEach(msg => {
                prependMessage(msg);
            });
            
            // 恢复滚动位置
            messagesDiv.scrollTop = scrollHeight - messagesDiv.scrollHeight + scrollTop;
            oldestMessageTimestamp = messages[0].timestamp;
        }
        isLoadingMore = false;
        document.getElementById('loadingMore').style.display = 'none';
    });

    // 监听用户加入/离开
    socket.on('userJoined', (data) => {
        updateOnlineCount(data.onlineCount);
        addUserToList(data.userId, data.username);
    });

    socket.on('userLeft', (data) => {
        updateOnlineCount(data.onlineCount);
        removeUserFromList(data.userId);
    });

    // 监听在线用户列表
    socket.on('onlineUsers', (users) => {
        updateUsersList(users);
        updateOnlineCount(users.length);
    });

    // 监听消息已读状态
    socket.on('messageRead', (data) => {
        updateMessageReadStatus(data.messageId, data.userId);
    });

    // 监听搜索结果
    socket.on('searchResults', (messages) => {
        displaySearchResults(messages);
    });

    // 连接错误
    socket.on('connect_error', (error) => {
        console.error('连接错误:', error);
        alert('无法连接到服务器，请检查服务器是否运行');
    });
}

// 发送消息
function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();

    if (!content && !selectedMedia) return;
    if (!socket || !socket.connected) {
        alert('未连接到服务器');
        return;
    }

    const message = {
        userId: currentUserId,
        username: currentUsername,
        roomId: currentRoomId,
        content: content,
        type: selectedMedia ? selectedMedia.type : 'text',
        mediaUrl: selectedMedia ? selectedMedia.url : null,
        mediaType: selectedMedia ? selectedMedia.mediaType : null
    };

    socket.emit('message', message);

    // 清空输入
    input.value = '';
    input.style.height = 'auto';
    
    // 如果是媒体消息，清空选择
    if (selectedMedia) {
        selectedMedia = null;
        document.getElementById('mediaInput').value = '';
    }
}

// 处理新消息
function handleNewMessage(message) {
    appendMessage(message);
    scrollToBottom();
    
    // 如果不是自己的消息，自动标记为已读
    if (message.userId !== currentUserId) {
        setTimeout(() => {
            socket.emit('markRead', {
                messageId: message.id,
                userId: currentUserId
            });
        }, 1000);
    }
}

// 追加消息
function appendMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = createMessageElement(message);
    messagesDiv.appendChild(messageDiv);
}

// 前置消息（用于懒加载）
function prependMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const loadingDiv = document.getElementById('loadingMore');
    const messageDiv = createMessageElement(message);
    messagesDiv.insertBefore(messageDiv, loadingDiv);
}

// 创建消息元素
function createMessageElement(message) {
    const div = document.createElement('div');
    div.className = `message ${message.userId === currentUserId ? 'own' : 'other'}`;
    div.dataset.messageId = message.id;

    const header = document.createElement('div');
    header.className = 'message-header';

    const username = document.createElement('span');
    username.className = 'message-username';
    username.textContent = message.username;

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime(message.timestamp);

    header.appendChild(username);
    header.appendChild(time);

    const content = document.createElement('div');
    content.className = 'message-content';

    if (message.type === 'text') {
        content.textContent = message.content;
    } else if (message.type === 'audio') {
        content.innerHTML = `
            <div>${message.content || '音频消息'}</div>
            <audio controls class="message-media">
                <source src="${message.mediaUrl}" type="${message.mediaType || 'audio/mpeg'}">
            </audio>
        `;
    } else if (message.type === 'video') {
        content.innerHTML = `
            <div>${message.content || '视频消息'}</div>
            <video controls class="message-media">
                <source src="${message.mediaUrl}" type="${message.mediaType || 'video/mp4'}">
            </video>
        `;
    } else if (message.type === 'image') {
        content.innerHTML = `
            <div>${message.content || '图片消息'}</div>
            <img src="${message.mediaUrl}" alt="图片" class="message-media">
        `;
    }

    const status = document.createElement('div');
    status.className = 'message-status';
    if (message.userId === currentUserId) {
        const readCount = message.readBy ? message.readBy.length : 0;
        status.innerHTML = `已读 ${readCount} <span class="message-read-count">👁</span>`;
    }

    div.appendChild(header);
    div.appendChild(content);
    div.appendChild(status);

    return div;
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
        return '刚刚';
    } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}小时前`;
    } else {
        return date.toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 滚动到底部
function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

// 处理滚动（懒加载）
function handleScroll() {
    const container = document.getElementById('messagesContainer');
    
    if (container.scrollTop < 100 && !isLoadingMore && oldestMessageTimestamp) {
        isLoadingMore = true;
        document.getElementById('loadingMore').style.display = 'block';
        
        socket.emit('loadMore', {
            roomId: currentRoomId,
            beforeTimestamp: oldestMessageTimestamp,
            limit: 20
        });
    }
}

// 媒体处理
let selectedMedia = null;

function handleMediaSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const url = e.target.result;
        let type = 'image';
        let mediaType = file.type;

        if (file.type.startsWith('audio/')) {
            type = 'audio';
        } else if (file.type.startsWith('video/')) {
            type = 'video';
        } else if (file.type.startsWith('image/')) {
            type = 'image';
        }

        selectedMedia = {
            type,
            url,
            mediaType,
            file
        };

        // 在输入框中显示文件名
        const input = document.getElementById('messageInput');
        input.value = `[${type === 'audio' ? '音频' : type === 'video' ? '视频' : '图片'}消息]`;
    };

    reader.readAsDataURL(file);
}

// 表情相关
function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
}

function insertEmoji(emoji) {
    const input = document.getElementById('messageInput');
    input.value += emoji;
    input.focus();
}

// 搜索功能
function toggleSearch() {
    const panel = document.getElementById('searchPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
        document.getElementById('searchInput').focus();
    }
}

function handleSearch(e) {
    const keyword = e.target.value.trim();
    if (keyword.length > 0) {
        socket.emit('search', {
            roomId: currentRoomId,
            keyword
        });
    } else {
        document.getElementById('searchResults').innerHTML = '';
    }
}

function displaySearchResults(messages) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    if (messages.length === 0) {
        resultsDiv.innerHTML = '<div class="search-result-item">未找到结果</div>';
        return;
    }

    messages.forEach(msg => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <strong>${msg.username}</strong>: ${msg.content}
            <div style="font-size: 12px; color: #999; margin-top: 4px;">${formatTime(msg.timestamp)}</div>
        `;
        item.addEventListener('click', () => {
            // 滚动到消息位置
            const messageEl = document.querySelector(`[data-message-id="${msg.id}"]`);
            if (messageEl) {
                messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                messageEl.style.background = '#fff3cd';
                setTimeout(() => {
                    messageEl.style.background = '';
                }, 2000);
            }
            toggleSearch();
        });
        resultsDiv.appendChild(item);
    });
}

// 房间管理
function toggleRoomPanel() {
    const panel = document.getElementById('roomPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    
    if (panel.style.display === 'block') {
        loadRoomList();
    }
}

function loadRoomList() {
    const serverUrl = typeof AndroidBridge !== 'undefined' && AndroidBridge.getServerUrl 
        ? AndroidBridge.getServerUrl() 
        : 'http://localhost:3000';
    
    fetch(`${serverUrl}/api/rooms`)
        .then(res => res.json())
        .then(rooms => {
            const listDiv = document.getElementById('roomList');
            listDiv.innerHTML = '';
            
            rooms.forEach(room => {
                const item = document.createElement('div');
                item.className = 'room-item';
                item.innerHTML = `
                    <span>${room.roomId}</span>
                    <span style="color: #999; font-size: 12px;">${room.memberCount} 人</span>
                `;
                item.addEventListener('click', () => {
                    // 切换房间
                    switchRoom(room.roomId);
                });
                listDiv.appendChild(item);
            });
        });
}

function createRoom() {
    const roomId = document.getElementById('newRoomInput').value.trim();
    if (!roomId) {
        alert('请输入房间ID');
        return;
    }

    const serverUrl = typeof AndroidBridge !== 'undefined' && AndroidBridge.getServerUrl 
        ? AndroidBridge.getServerUrl() 
        : 'http://localhost:3000';

    fetch(`${serverUrl}/api/rooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('房间创建成功');
            loadRoomList();
            document.getElementById('newRoomInput').value = '';
        } else {
            alert(data.message || '创建失败');
        }
    });
}

function switchRoom(roomId) {
    if (socket) {
        socket.disconnect();
    }
    
    currentRoomId = roomId;
    document.getElementById('roomIdInput').value = roomId;
    document.getElementById('loginPanel').style.display = 'flex';
    
    toggleRoomPanel();
}

// 用户列表管理
function updateUsersList(users) {
    const listDiv = document.getElementById('usersList');
    listDiv.innerHTML = '';
    
    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'user-item';
        item.textContent = user.username;
        listDiv.appendChild(item);
    });
}

function addUserToList(userId, username) {
    const listDiv = document.getElementById('usersList');
    const item = document.createElement('div');
    item.className = 'user-item';
    item.dataset.userId = userId;
    item.textContent = username;
    listDiv.appendChild(item);
}

function removeUserFromList(userId) {
    const item = document.querySelector(`[data-user-id="${userId}"]`);
    if (item) {
        item.remove();
    }
}

function updateOnlineCount(count) {
    document.getElementById('onlineCount').textContent = `${count} 人在线`;
}

function updateMessageReadStatus(messageId, userId) {
    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl && messageEl.classList.contains('own')) {
        const statusEl = messageEl.querySelector('.message-status');
        if (statusEl) {
            const readCount = parseInt(statusEl.textContent.match(/\d+/)?.[0] || 0) + 1;
            statusEl.innerHTML = `已读 ${readCount} <span class="message-read-count">👁</span>`;
        }
    }
}

// Android 桥接
function setupAndroidBridge() {
    // 检查是否在 Android WebView 中
    if (typeof AndroidBridge === 'undefined') {
        console.log('不在 Android WebView 环境中');
        return;
    }

    console.log('Android Bridge 已连接');

    // 获取设备信息
    try {
        const deviceInfoJson = AndroidBridge.getDeviceInfo();
        const deviceInfo = JSON.parse(deviceInfoJson);
        console.log('设备信息:', deviceInfo);
    } catch (e) {
        console.error('获取设备信息失败:', e);
    }

    // 监听原生方法调用（如果需要双向通信）
    window.handleNativeMessage = function(method, data) {
        console.log('收到原生消息:', method, data);
        handleNativeMessage({ type: method, data: data });
    };
}

function handleNativeMessage(data) {
    // 处理来自原生的消息（如推送通知）
    if (data.type === 'notification') {
        // 显示通知
        showNotification(data.title, data.body);
    }
}

function showNotification(title, body) {
    // 简单的通知实现
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body });
            }
        });
    }
}
