// routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Tạo thanh toán mới - người dùng đã xác thực
router.post('/', authenticateJWT, paymentController.createPayment);

// Lấy thông tin thanh toán - người dùng đã xác thực
router.get('/:id', authenticateJWT, paymentController.getPaymentById);

// Cập nhật trạng thái thanh toán - chỉ admin
router.put('/:id/status', authenticateJWT, authorizeRole('admin'), paymentController.updatePaymentStatus);

router.post('/', authenticateJWT, paymentController.createPayment);

module.exports = router;
