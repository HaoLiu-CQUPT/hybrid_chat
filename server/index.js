const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Database = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// 初始化数据库
const db = new Database();
db.init();

// 存储在线用户
const onlineUsers = new Map();
// 存储房间信息 {roomId: Set<userId>}
const rooms = new Map();

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  // 用户加入聊天
  socket.on('join', async (data) => {
    const { userId, username, roomId } = data;
    socket.userId = userId;
    socket.username = username || `用户${userId}`;
    socket.roomId = roomId || 'default';

    // 加入房间
    if (!rooms.has(socket.roomId)) {
      rooms.set(socket.roomId, new Set());
    }
    rooms.get(socket.roomId).add(userId);
    socket.join(socket.roomId);

    // 更新在线用户
    onlineUsers.set(userId, {
      socketId: socket.id,
      username: socket.username,
      roomId: socket.roomId,
      joinTime: Date.now()
    });

    // 通知房间内其他用户
    socket.to(socket.roomId).emit('userJoined', {
      userId,
      username: socket.username,
      timestamp: Date.now(),
      onlineCount: rooms.get(socket.roomId).size
    });

    // 发送历史消息
    const history = await db.getMessages(socket.roomId, 50);
    socket.emit('history', history);

    // 发送在线用户列表
    const roomUsers = Array.from(rooms.get(socket.roomId)).map(id => ({
      userId: id,
      username: onlineUsers.get(id)?.username || `用户${id}`
    }));
    socket.emit('onlineUsers', roomUsers);
  });

  // 发送消息
  socket.on('message', async (data) => {
    const { userId, username, roomId, content, type = 'text', mediaUrl, mediaType } = data;
    
    const message = {
      id: require('uuid').v4(),
      userId,
      username: username || socket.username || `用户${userId}`,
      roomId: roomId || socket.roomId || 'default',
      content,
      type, // text, audio, video, image
      mediaUrl,
      mediaType,
      timestamp: Date.now(),
      readBy: [userId] // 发送者自动标记为已读
    };

    // 保存到数据库
    await db.saveMessage(message);

    // 广播消息到房间
    io.to(message.roomId).emit('message', message);

    console.log('消息发送:', message);
  });

  // 标记消息已读
  socket.on('markRead', async (data) => {
    const { messageId, userId } = data;
    await db.markMessageRead(messageId, userId);
    
    // 通知房间内其他用户
    socket.to(socket.roomId).emit('messageRead', {
      messageId,
      userId
    });
  });

  // 获取更多历史消息（懒加载）
  socket.on('loadMore', async (data) => {
    const { roomId, beforeTimestamp, limit = 20 } = data;
    const messages = await db.getMessagesBefore(roomId, beforeTimestamp, limit);
    socket.emit('moreHistory', messages);
  });

  // 搜索消息
  socket.on('search', async (data) => {
    const { roomId, keyword } = data;
    const messages = await db.searchMessages(roomId, keyword);
    socket.emit('searchResults', messages);
  });

  // 断开连接
  socket.on('disconnect', () => {
    if (socket.userId && socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.delete(socket.userId);
        if (room.size === 0) {
          rooms.delete(socket.roomId);
        } else {
          // 通知房间内其他用户
          socket.to(socket.roomId).emit('userLeft', {
            userId: socket.userId,
            username: socket.username,
            timestamp: Date.now(),
            onlineCount: room.size
          });
        }
      }
      onlineUsers.delete(socket.userId);
    }
    console.log('用户断开连接:', socket.id);
  });
});

// REST API - 获取房间列表
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.keys()).map(roomId => ({
    roomId,
    memberCount: rooms.get(roomId).size
  }));
  res.json(roomList);
});

// REST API - 创建房间
app.post('/api/rooms', (req, res) => {
  const { roomId } = req.body;
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
    res.json({ success: true, roomId });
  } else {
    res.json({ success: false, message: '房间已存在' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});


