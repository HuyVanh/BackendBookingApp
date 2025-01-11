// routes/notifications.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizeRole');

// Tạo thông báo mới (chỉ admin)
router.post('/', authenticateJWT, authorizeRole('admin'), notificationController.createNotification);

// Lấy danh sách thông báo của người dùng
router.get('/', authenticateJWT, notificationController.getUserNotifications);

// Đánh dấu thông báo là đã đọc
router.put('/:id/read', authenticateJWT, notificationController.markAsRead);

// Xóa thông báo
router.delete('/:id', authenticateJWT, notificationController.deleteNotification, authorizeRole('admin'));

router.post('/booking-notification', authenticateJWT, notificationController.createBookingNotification);
router.put('/mark-all-read', authenticateJWT, notificationController.markAllAsRead);

module.exports = router;
