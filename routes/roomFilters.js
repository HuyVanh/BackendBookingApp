// routes/roomFilters.js
const express = require('express');
const router = express.Router();
const roomFilterController = require('../controllers/roomFilterController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware'); // Sửa require middleware

// Lấy bộ lọc phòng của người dùng - chỉ người dùng đã xác thực
router.get('/', authenticateJWT, roomFilterController.getRoomFilter);

// Tạo hoặc cập nhật bộ lọc phòng - chỉ người dùng đã xác thực
router.post('/', authenticateJWT, roomFilterController.createOrUpdateRoomFilter);

// Xóa bộ lọc phòng - chỉ admin hoặc người dùng đã tạo bộ lọc
router.delete('/', authenticateJWT, authorizeRole('admin'), roomFilterController.deleteRoomFilter);

module.exports = router;
