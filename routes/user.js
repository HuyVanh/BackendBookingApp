// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// Lấy danh sách người dùng (chỉ admin)
router.get('/', authenticateJWT, authorizeRole('admin'), userController.getAllUsers);

// Thay đổi trạng thái người dùng (chỉ admin)
router.patch('/:id/toggle', authenticateJWT, authorizeRole('admin'), userController.toggleUserStatus);

// Lấy danh sách nhân viên (chỉ admin)
router.get('/staff', authenticateJWT, authorizeRole('admin'), userController.getStaffList);

// Thêm nhân viên mới (chỉ admin)
router.post('/staff', authenticateJWT, authorizeRole('admin'), userController.createStaff);

// Cập nhật thông tin nhân viên (chỉ admin)
router.put('/staff/:id', authenticateJWT, authorizeRole('admin'), userController.updateStaff);

// Bật/Tắt trạng thái hoạt động của nhân viên (chỉ admin)
router.patch('/staff/:id/toggle', authenticateJWT, authorizeRole('admin'), userController.toggleStaffStatus);

module.exports = router;


// Các route liên quan đến favorites
router.post('/favorites', authenticateJWT, userController.addFavorite);
router.get('/favorites', authenticateJWT, userController.getFavorites);
router.delete('/favorites', authenticateJWT, userController.removeFavorite);

// Bạn có thể thêm các route người dùng khác ở đây

module.exports = router;
