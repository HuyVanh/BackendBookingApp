// routes/rooms.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Lấy danh sách phòng - Có thể là public hoặc yêu cầu xác thực
router.get('/', authenticateJWT, roomController.getAllRooms);

// Lấy chi tiết phòng - Có thể là public hoặc yêu cầu xác thực
router.get('/:id', authenticateJWT, roomController.getRoomById);

// Tạo phòng mới - chỉ admin
router.post('/', authenticateJWT, authorizeRole('admin'), roomController.createRoom);

// Cập nhật phòng - chỉ admin
router.put('/:id', authenticateJWT, authorizeRole('admin'), roomController.updateRoom);

// Xóa phòng - chỉ admin
router.delete('/:id', authenticateJWT, authorizeRole('admin'), roomController.deleteRoom);

module.exports = router; // Xuất router trực tiếp
