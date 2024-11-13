// routes/paymentMethods.js
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware'); // Sửa require middleware

// Tạo phương thức thanh toán mới - chỉ admin
router.post('/', authenticateJWT, authorizeRole('admin'), paymentMethodController.createPaymentMethod);

// Lấy tất cả phương thức thanh toán của người dùng - chỉ người dùng đã xác thực
router.get('/', authenticateJWT, paymentMethodController.getUserPaymentMethods);

// Cập nhật phương thức thanh toán - chỉ admin
router.put('/:id', authenticateJWT, authorizeRole('admin'), paymentMethodController.updatePaymentMethod);

// Xóa phương thức thanh toán - chỉ admin
router.delete('/:id', authenticateJWT, authorizeRole('admin'), paymentMethodController.deletePaymentMethod);

module.exports = router;
