// routes/statistics.js

const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Lấy thống kê tổng quan (có hỗ trợ filter)
router.get('/', authenticateJWT, authorizeRole('admin'), statisticsController.getStatistics);

// Thống kê doanh thu theo ngày (có hỗ trợ filter)
router.get('/revenue-per-day', authenticateJWT, authorizeRole('admin'), statisticsController.getRevenueStats);

// Thống kê doanh thu theo chi nhánh
router.get('/branch-revenue', authenticateJWT, authorizeRole('admin'), statisticsController.getBranchRevenue);

module.exports = router;