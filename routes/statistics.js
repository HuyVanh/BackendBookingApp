// routes/statistics.js

const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Lấy thống kê tổng quan (chỉ dành cho admin)
router.get('/', authenticateJWT, authorizeRole('admin'), statisticsController.getStatistics);

// Thống kê số lượng đặt phòng theo ngày (chỉ dành cho admin)
router.get('/bookings-per-day', authenticateJWT, authorizeRole('admin'), statisticsController.getBookingStats);

// Thống kê doanh thu theo ngày (chỉ dành cho admin)
router.get('/revenue-per-day', authenticateJWT, authorizeRole('admin'), statisticsController.getRevenueStats);

module.exports = router;
