const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Lấy danh sách đặt phòng của người dùng
router.get('/', auth, bookingController.getUserBookings);

// Tạo đặt phòng mới
router.post('/', auth, bookingController.createBooking);

// Lấy chi tiết đặt phòng
router.get('/:id', auth, bookingController.getBookingById);

// Cập nhật trạng thái đặt phòng
router.put('/:id/status', auth, bookingController.updateBookingStatus);

// Hủy đặt phòng
router.delete('/:id', auth, bookingController.cancelBooking);

module.exports = router;
