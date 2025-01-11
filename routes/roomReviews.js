const express = require('express');
const router = express.Router();
const roomreviewController = require('../controllers/roomReviewController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Tạo review mới
router.post('/', authenticateJWT, roomreviewController.createReview);

// Lấy reviews theo phòng
router.get('/room/:roomId', roomreviewController.getReviewsByRoom);

// Lấy reviews của user đã đăng nhập
router.get('/user', authenticateJWT, roomreviewController.getReviewsByUser);

module.exports = router;