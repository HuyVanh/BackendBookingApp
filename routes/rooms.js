// routes/rooms.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize'); // Giả sử bạn đã tạo middleware authorize

// Lấy danh sách phòng
router.get('/', auth.authenticateToken, roomController.getAllRooms);

// Lấy chi tiết phòng
router.get('/:id', auth.authenticateToken, roomController.getRoomById);

// Tạo phòng mới - chỉ admin
router.post('/', auth.authenticateToken, authorize('admin'), roomController.createRoom);

// Cập nhật phòng - chỉ admin
router.put('/:id', auth.authenticateToken, authorize('admin'), roomController.updateRoom);

// Xóa phòng - chỉ admin
router.delete('/:id', auth.authenticateToken, authorize('admin'), roomController.deleteRoom);

module.exports = router; // Xuất router trực tiếp
