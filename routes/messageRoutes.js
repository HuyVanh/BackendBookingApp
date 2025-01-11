// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Các routes hiện tại
router.get('/:userId', authenticateJWT, messageController.getMessages);
router.post('/send', authenticateJWT, messageController.sendMessage);
router.put('/read/:userId', authenticateJWT, messageController.markAsRead);
router.get('/admin/chats', authenticateJWT, messageController.getAdminChats);

// Thêm routes mới
router.post('/mark-all-read', authenticateJWT, messageController.markAllAsRead);
router.get('/unread/count', authenticateJWT, messageController.getUnreadCount);

module.exports = router;