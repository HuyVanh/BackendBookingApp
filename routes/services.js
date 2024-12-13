const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Lấy tất cả dịch vụ (dành cho admin)
router.get('/admin', authenticateJWT, authorizeRole('admin'), serviceController.getAllServicesAdmin);

// Lấy danh sách dịch vụ (cho tất cả người dùng)
router.get('/', authenticateJWT, serviceController.getAllServices);

// Tạo dịch vụ mới (chỉ admin)
router.post('/', authenticateJWT, authorizeRole('admin'), serviceController.createService);

// Cập nhật dịch vụ (chỉ admin)
router.put('/:id', authenticateJWT, authorizeRole('admin'), serviceController.updateService);

// Thay đổi trạng thái dịch vụ (chỉ admin)
router.patch('/:id/toggle', authenticateJWT, authorizeRole('admin'), serviceController.toggleServiceStatus);

module.exports = router;
