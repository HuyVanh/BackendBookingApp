// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route GET /api/admin/dashboard
 * @desc Lấy dashboard admin
 * @access Admin
 */
router.get('/dashboard', authenticateJWT, authorizeRole('admin'), adminController.dashboard);

// Bạn có thể thêm các route admin khác ở đây

module.exports = router;
