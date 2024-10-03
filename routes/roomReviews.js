const express = require('express');
const router = express.Router();
const roomReviewController = require('../controllers/roomReviewController');
const auth = require('../middleware/auth');

// Tạo đánh giá phòng
router.post('/', auth, roomReviewController.createReview);

// Lấy đánh giá cho một phòng
router.get('/room/:roomId', roomReviewController.getReviewsByRoom);

// Lấy đánh giá của người dùng
router.get('/user/:userId', auth, roomReviewController.getReviewsByUser);

module.exports = router;
