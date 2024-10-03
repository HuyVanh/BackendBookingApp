const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Tạo thanh toán mới
router.post('/', auth, paymentController.createPayment);

// Lấy thông tin thanh toán
router.get('/:id', auth, paymentController.getPaymentById);

// Cập nhật trạng thái thanh toán
router.put('/:id/status', auth, paymentController.updatePaymentStatus);

module.exports = router;
