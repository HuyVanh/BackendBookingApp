// routes/bookings.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { body } = require('express-validator');
const { authenticateJWT, authorizeCancelBooking } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizeRole'); // Import authorizeRole từ tệp riêng

// Lấy danh sách đặt phòng của người dùng
router.get('/', authenticateJWT, bookingController.getUserBookings);

// Lấy chi tiết đặt phòng
router.get('/:id', authenticateJWT, bookingController.getBookingById);

// Cập nhật trạng thái đặt phòng - chỉ admin
router.put('/:id/status', authenticateJWT, authorizeRole('admin'), bookingController.updateBookingStatus);

// Hủy đặt phòng - chỉ admin hoặc người dùng đã đặt phòng
router.delete('/:id', authenticateJWT, authorizeCancelBooking, bookingController.cancelBooking);

// Tạo đặt phòng mới với kiểm tra dữ liệu
router.post(
  '/',
  authenticateJWT,
  [
    body('room_id').notEmpty().withMessage('room_id là bắt buộc.'),
    body('check_in').isISO8601().withMessage('Ngày check-in không hợp lệ.'),
    body('check_out').isISO8601().withMessage('Ngày check-out không hợp lệ.'),
    body('guests_count').isInt({ min: 1 }).withMessage('Số lượng khách phải lớn hơn 0.'),
    body('personal_info.full_name').notEmpty().withMessage('Họ và tên là bắt buộc.'),
    body('personal_info.date_of_birth').isISO8601().withMessage('Ngày sinh không hợp lệ.'),
    body('personal_info.email').isEmail().withMessage('Email không hợp lệ.'),
    body('personal_info.phone_number').notEmpty().withMessage('Số điện thoại là bắt buộc.'),
  ],
  bookingController.createBooking
);

module.exports = router;
