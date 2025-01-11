// routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Tạo payment intent cho Stripe
router.post('/create-payment-intent', authenticateJWT, paymentController.createPayment);

// Xác nhận thanh toán từ Stripe
router.post('/confirm-payment', authenticateJWT, paymentController.confirmPayment);

// Lấy thông tin thanh toán
router.get('/:id', authenticateJWT, paymentController.getPaymentById);

// Cập nhật trạng thái thanh toán - chỉ admin
router.put('/:id/status', authenticateJWT, authorizeRole('admin'), paymentController.updatePaymentStatus);

// Xóa route trùng lặp này vì đã có ở trên
// router.post('/', authenticateJWT, paymentController.createPayment);

module.exports = router;