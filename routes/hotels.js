const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Tạo mới khách sạn - chỉ admin
router.post('/', authenticateJWT, authorizeRole('admin'), hotelController.createHotel);

// Lấy danh sách khách sạn - có thể cho public hoặc yêu cầu xác thực tùy ý
router.get('/', authenticateJWT, hotelController.getAllHotels);

// Lấy chi tiết 1 khách sạn - có thể cho public hoặc yêu cầu xác thực tùy ý
router.get('/:id', authenticateJWT, hotelController.getHotelById);

// Cập nhật thông tin khách sạn - chỉ admin
router.put('/:id', authenticateJWT, authorizeRole('admin'), hotelController.updateHotel);

// Xóa khách sạn - chỉ admin
router.delete('/:id', authenticateJWT, authorizeRole('admin'), hotelController.deleteHotel);
// **Thêm route bật/tắt trạng thái khách sạn - chỉ admin**
router.patch('/:id/toggle', authenticateJWT, authorizeRole('admin'), hotelController.toggleHotelStatus);

module.exports = router;
