const express = require('express');
const router = express.Router();
const searchHistoryController = require('../controllers/searchHistoryController');
const auth = require('../middleware/auth');

// Lưu lịch sử tìm kiếm
router.post('/', auth, searchHistoryController.saveSearch);

// Lấy lịch sử tìm kiếm của người dùng
router.get('/', auth, searchHistoryController.getUserSearchHistory);

// Xóa lịch sử tìm kiếm
router.delete('/:id', auth, searchHistoryController.deleteSearchHistory);

module.exports = router;
