const fs = require('fs');
const path = require('path');

class ChatDatabase {
  constructor() {
    const dbPath = path.join(__dirname, 'chat.json');
    this.dbPath = dbPath;
    
    // 如果文件不存在，创建空数据库
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({ messages: [] }), 'utf8');
    }
    
    this.load();
  }

  load() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      this.data = JSON.parse(data);
      if (!this.data.messages) {
        this.data.messages = [];
      }
    } catch (err) {
      console.error('加载数据库失败:', err);
      this.data = { messages: [] };
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('保存数据库失败:', err);
    }
  }

  init() {
    // JSON 文件存储不需要初始化表结构
    console.log('数据库初始化完成');
  }

  // 保存消息
  saveMessage(message) {
    try {
      this.data.messages.push(message);
      this.save();
      return Promise.resolve(message.id);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // 获取消息历史
  getMessages(roomId, limit = 50) {
    try {
      const messages = this.data.messages
        .filter(msg => msg.roomId === roomId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .reverse(); // 反转顺序，最新的在最后
      
      return Promise.resolve(messages);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // 获取指定时间之前的消息（用于懒加载）
  getMessagesBefore(roomId, beforeTimestamp, limit = 20) {
    try {
      const messages = this.data.messages
        .filter(msg => msg.roomId === roomId && msg.timestamp < beforeTimestamp)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
        .reverse();
      
      return Promise.resolve(messages);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // 标记消息已读
  markMessageRead(messageId, userId) {
    try {
      const message = this.data.messages.find(msg => msg.id === messageId);
      if (message) {
        if (!message.readBy) {
          message.readBy = [];
        }
        if (!message.readBy.includes(userId)) {
          message.readBy.push(userId);
          this.save();
        }
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // 搜索消息
  searchMessages(roomId, keyword) {
    try {
      const messages = this.data.messages
        .filter(msg => 
          msg.roomId === roomId && 
          msg.content && 
          msg.content.toLowerCase().includes(keyword.toLowerCase())
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 100);
      
      return Promise.resolve(messages);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  close() {
    // JSON 文件存储不需要关闭连接
    return Promise.resolve();
  }
}

module.exports = ChatDatabase;
