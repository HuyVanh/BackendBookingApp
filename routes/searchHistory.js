// routes/searchHistory.js
const express = require('express');
const router = express.Router();
const searchHistoryController = require('../controllers/searchHistoryController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware'); // Sửa require middleware

// Lưu lịch sử tìm kiếm - chỉ người dùng đã xác thực
router.post('/', authenticateJWT, searchHistoryController.saveSearch);

// Lấy lịch sử tìm kiếm của người dùng - chỉ người dùng đã xác thực
router.get('/', authenticateJWT, searchHistoryController.getUserSearchHistory);

// Xóa lịch sử tìm kiếm - chỉ admin hoặc người dùng đã tạo lịch sử
router.delete('/:id', authenticateJWT, authorizeRole('admin'), searchHistoryController.deleteSearchHistory);

module.exports = router;
