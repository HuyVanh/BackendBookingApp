// routes/rooms.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Lấy danh sách phòng phổ biến
router.get('/popular', authenticateJWT, roomController.getPopularRooms);

// Lấy danh sách phòng xu hướng
router.get('/trending', authenticateJWT, roomController.getTrendingRooms);

// Lấy danh sách phòng gợi ý cho người dùng
router.get('/suggested', authenticateJWT, roomController.getSuggestedRooms);

// Lấy danh sách phòng
router.get('/', authenticateJWT, roomController.getAllRooms);

// Lấy chi tiết phòng
router.get('/:id', authenticateJWT, roomController.getRoomById);

// Tạo phòng mới - chỉ admin
router.post('/', authenticateJWT, authorizeRole('admin'), roomController.createRoom);

// Cập nhật phòng - chỉ admin
router.put('/:id', authenticateJWT, authorizeRole('admin'), roomController.updateRoom);

// Xóa phòng - chỉ admin
router.delete('/:id', authenticateJWT, authorizeRole('admin'), roomController.deleteRoom);

module.exports = router;
