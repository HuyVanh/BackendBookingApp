const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const auth = require('../middleware/auth');

// Tạo phương thức thanh toán mới
router.post('/', auth, paymentMethodController.createPaymentMethod);

// Lấy tất cả phương thức thanh toán của người dùng
router.get('/', auth, paymentMethodController.getUserPaymentMethods);

// Cập nhật phương thức thanh toán
router.put('/:id', auth, paymentMethodController.updatePaymentMethod);

// Xóa phương thức thanh toán
router.delete('/:id', auth, paymentMethodController.deletePaymentMethod);

module.exports = router;
