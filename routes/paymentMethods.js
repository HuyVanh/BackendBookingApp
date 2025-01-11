// routes/paymentMethods.js
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Đảm bảo paymentMethodController có các hàm này
router.get('/', paymentMethodController.getAllPaymentMethods);
router.post('/', authenticateJWT, authorizeRole('admin'), paymentMethodController.createPaymentMethod);
router.get('/:id', paymentMethodController.getPaymentMethodById);
router.put('/:id', authenticateJWT, authorizeRole('admin'), paymentMethodController.updatePaymentMethod);
router.delete('/:id', authenticateJWT, authorizeRole('admin'), paymentMethodController.deletePaymentMethod);

module.exports = router;