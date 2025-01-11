// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');

const messageController = {
  // Lấy tin nhắn cho user cụ thể
  getMessages: async (req, res) => {
    try {
      const { userId } = req.params;
      const { room } = req.query;
  
      console.log('Getting messages:', { userId, room });
  
      let query = {};
      
      // Nếu có room ID, ưu tiên lấy theo room
      if (room) {
        query.room = room;
      } else {
        // Nếu không có room, lấy theo logic cũ
        query = {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        };
      }
  
      const messages = await Message.find(query)
        .populate('sender', 'username role')
        .populate('receiver', 'username role')
        .sort({ createdAt: 1 });
  
      console.log(`Found ${messages.length} messages`, {
        query,
        messageIds: messages.map(m => m._id),
        senders: messages.map(m => ({
          id: m.sender._id,
          role: m.sender.role
        }))
      });
  
      res.json({
        success: true,
        messages
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching messages'
      });
    }
  },

  // Gửi tin nhắn
  sendMessage: async (req, res) => {
    try {
      const { receiverId, content, room } = req.body;
      const senderId = req.user._id;

      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        room // Thêm trường room
      });

      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'username role')
        .populate('receiver', 'username role');

      res.json({
        success: true,
        message: populatedMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending message'
      });
    }
  },
   // Đánh dấu tin nhắn đã đọc
   markAsRead: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = req.user._id;

      await Message.updateMany(
        { sender: userId, receiver: currentUser, isRead: false },
        { isRead: true }
      );

      res.json({
        success: true,
        message: 'Messages marked as read'
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking messages as read'
      });
    }
  },

  
  markAllAsRead: async (req, res) => {
    try {
      const { senderId } = req.body;
      const currentUser = req.user._id;

      const result = await Message.updateMany(
        { 
          sender: senderId, 
          receiver: currentUser, 
          isRead: false 
        },
        { isRead: true }
      );

      res.json({
        success: true,
        message: 'All messages marked as read',
        updatedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Error marking all messages as read'
      });
    }
  },
   // Thêm phương thức lấy số tin nhắn chưa đọc
  getUnreadCount: async (req, res) => {
    try {
      const currentUser = req.user._id;
      
      const unreadCount = await Message.countDocuments({
        receiver: currentUser,
        isRead: false
      });

      res.json({
        success: true,
        unreadCount
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting unread count'
      });
    }
  },

  // Lấy danh sách chat cho admin
  getAdminChats: async (req, res) => {
    try {
      const admin = req.user;
      console.log('Admin requesting chats:', admin);

      // Kiểm tra role admin
      if (admin.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access'
        });
      }

      // Tìm tất cả tin nhắn unique theo người gửi
      const uniqueChats = await Message.aggregate([
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$sender', admin._id] },
                '$receiver',
                '$sender'
              ]
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$receiver', admin._id] },
                      { $eq: ['$isRead', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Populate thông tin user
      const populatedChats = await User.populate(uniqueChats, {
        path: '_id',
        select: 'username role'
      });

      res.json({
        success: true,
        chats: populatedChats
      });
    } catch (error) {
      console.error('Error fetching admin chats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching admin chats'
      });
    }
  }
};

module.exports = messageController;