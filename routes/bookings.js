// routes/bookings.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware'); // Sửa require middleware

// Lấy danh sách đặt phòng của người dùng
router.get('/', authenticateJWT, bookingController.getUserBookings);

// Tạo đặt phòng mới
router.post('/', authenticateJWT, bookingController.createBooking);

// Lấy chi tiết đặt phòng
router.get('/:id', authenticateJWT, bookingController.getBookingById);

// Cập nhật trạng thái đặt phòng - chỉ admin
router.put('/:id/status', authenticateJWT, authorizeRole('admin'), bookingController.updateBookingStatus);

// Hủy đặt phòng - chỉ admin hoặc người dùng đã đặt phòng
router.delete('/:id', authenticateJWT, authorizeRole('admin'), bookingController.cancelBooking);

module.exports = router;
