// routes/paymentMethods.js
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Tạo phương thức thanh toán mới - người dùng đã xác thực
router.post('/', authenticateJWT, paymentMethodController.createPaymentMethod);

// Lấy tất cả phương thức thanh toán của người dùng - người dùng đã xác thực
router.get('/', authenticateJWT, paymentMethodController.getUserPaymentMethods);

// Cập nhật phương thức thanh toán - người dùng đã xác thực
router.put('/:id', authenticateJWT, paymentMethodController.updatePaymentMethod);

// Xóa phương thức thanh toán - người dùng đã xác thực
router.delete('/:id', authenticateJWT, paymentMethodController.deletePaymentMethod);

module.exports = router;
