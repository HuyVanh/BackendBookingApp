const express = require('express');
const router = express.Router();
const roomFilterController = require('../controllers/roomFilterController');
const auth = require('../middleware/auth');

// Lấy bộ lọc phòng của người dùng
router.get('/', auth, roomFilterController.getRoomFilter);

// Tạo hoặc cập nhật bộ lọc phòng
router.post('/', auth, roomFilterController.createOrUpdateRoomFilter);

// Xóa bộ lọc phòng
router.delete('/', auth, roomFilterController.deleteRoomFilter);

module.exports = router;
