// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

/**
 * @route POST /api/auth/register
 * @desc Đăng ký người dùng mới
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Đăng nhập người dùng
 * @access Public
 */
router.post('/login', authController.login);
/**
 * @route GET /api/auth/me
 * @desc Lấy thông tin người dùng hiện tại
 * @access Protected
 */
router.get('/me', authenticateJWT, authController.getMe);
/**
 * @route PUT /api/auth/update-profile
 * @desc Cập nhật thông tin người dùng
 * @access Protected
 */
/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', authController.resetPassword);
router.put('/update-profile', authenticateJWT, authController.updateProfile);
router.get('/profile', authenticateJWT, authController.getProfile);
router.put('/change-password', authenticateJWT, authController.changePassword);
module.exports = router;
