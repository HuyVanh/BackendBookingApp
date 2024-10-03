// routes/rooms.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize'); // Nếu bạn đã tạo middleware authorize

// Lấy danh sách phòng
router.get('/', roomController.getAllRooms);

// Lấy chi tiết phòng
router.get('/:id', roomController.getRoomById);

// Tạo phòng mới - chỉ admin
router.post('/', auth, authorize('admin'), roomController.createRoom);

// Cập nhật phòng - chỉ admin
router.put('/:id', auth, authorize('admin'), roomController.updateRoom);

// Xóa phòng - chỉ admin
router.delete('/:id', auth, authorize('admin'), roomController.deleteRoom);

module.exports = router; // Xuất router trực tiếp
