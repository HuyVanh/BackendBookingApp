const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Lấy danh sách dịch vụ (cho tất cả người dùng đã đăng nhập)
// Hoặc bỏ 'authenticateJWT' nếu muốn truy cập công khai
router.get('/', authenticateJWT, serviceController.getAllServices);

// Tạo dịch vụ mới (chỉ admin)
router.post('/', authenticateJWT, authorizeRole('admin'), serviceController.createService);

// Cập nhật dịch vụ (chỉ admin)
router.put('/:id', authenticateJWT, authorizeRole('admin'), serviceController.updateService);

// Xóa dịch vụ (chỉ admin)
router.delete('/:id', authenticateJWT, authorizeRole('admin'), serviceController.deleteService);

module.exports = router;
