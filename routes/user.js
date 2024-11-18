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

/**
 * @route POST /api/user/favorites
 * @desc Thêm phòng vào danh sách yêu thích
 * @access Authenticated User
 */
router.post('/favorites', authenticateJWT, userController.addFavorite);

/**
 * @route GET /api/user/favorites
 * @desc Lấy danh sách phòng yêu thích của người dùng
 * @access Authenticated User
 */
router.get('/favorites', authenticateJWT, userController.getFavorites);

/**
 * @route DELETE /api/user/favorites
 * @desc Xóa phòng khỏi danh sách yêu thích
 * @access Authenticated User
 */
router.delete('/favorites', authenticateJWT, userController.removeFavorite);

// Bạn có thể thêm các route người dùng khác ở đây

module.exports = router;
