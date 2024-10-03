const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Tạo thông báo mới (có thể chỉ admin làm được)
router.post('/', auth, notificationController.createNotification);

// Lấy tất cả thông báo của người dùng
router.get('/', auth, notificationController.getUserNotifications);

// Đánh dấu thông báo là đã đọc
router.put('/:id/read', auth, notificationController.markAsRead);

// Xóa thông báo
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
