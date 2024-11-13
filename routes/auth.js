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

module.exports = router;
