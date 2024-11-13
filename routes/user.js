// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/authMiddleware');

/**
 * @route GET /api/user/profile
 * @desc Lấy hồ sơ người dùng
 * @access Authenticated User
 */
router.get('/profile', authenticateJWT, userController.getProfile);

// Bạn có thể thêm các route người dùng khác ở đây

module.exports = router;
