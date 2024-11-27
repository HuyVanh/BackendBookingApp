// routes/statistics.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Lấy thống kê (chỉ admin)
router.get('/', authenticateJWT, authorizeRole('admin'), statisticsController.getStatistics);


// Thống kê đặt phòng theo ngày
router.get('/bookings-per-day', authenticateJWT, authorizeRole('admin'), statisticsController.getBookingStats);


module.exports = router;
