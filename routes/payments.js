// routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware'); // Sửa require middleware

// Tạo thanh toán mới - chỉ người dùng đã xác thực
router.post('/', authenticateJWT, paymentController.createPayment);

// Lấy thông tin thanh toán - chỉ người dùng đã xác thực
router.get('/:id', authenticateJWT, paymentController.getPaymentById);

// Cập nhật trạng thái thanh toán - chỉ admin
router.put('/:id/status', authenticateJWT, authorizeRole('admin'), paymentController.updatePaymentStatus);

module.exports = router;
