// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateJWT,
  authorizeRole,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Lấy danh sách người dùng (chỉ admin)
router.get(
  "/",
  authenticateJWT,
  authorizeRole("admin"),
  userController.getAllUsers
);

// Thay đổi trạng thái người dùng (chỉ admin)
router.patch(
  "/:id/toggle",
  authenticateJWT,
  authorizeRole("admin"),
  userController.toggleUserStatus
);

// Lấy danh sách nhân viên (chỉ admin)
router.get(
  "/staff",
  authenticateJWT,
  authorizeRole("admin"),
  userController.getStaffList
);

// Thêm nhân viên mới (chỉ admin)
router.post(
  "/staff",
  authenticateJWT,
  authorizeRole("admin"),
  userController.createStaff
);
// Lấy chi tiết nhân viên (chỉ admin)
router.get(
  "/staff/:id",
  authenticateJWT,
  authorizeRole("admin"),
  userController.getStaffById
);

// Cập nhật thông tin nhân viên (chỉ admin)
router.put(
  "/staff/:id",
  authenticateJWT,
  authorizeRole("admin"),
  userController.updateStaff
);

// Bật/Tắt trạng thái hoạt động của nhân viên (chỉ admin)
router.patch(
  "/staff/:id/toggle",
  authenticateJWT,
  authorizeRole("admin"),
  userController.toggleStaffStatus
);
// Giả sử chỉ cần authenticateJWT, không cần authorizeRole
router.put(
  "/update-avatar",
  authenticateJWT,
  upload.single("avatar"),
  userController.updateAvatar
);
// Thêm route lấy thông tin admin (chỉ admin)
router.get(
  "/admin-info",
  authenticateJWT,
  authorizeRole("admin"),
  userController.getAdminInfo
);
// Đổi mật khẩu admin (chỉ admin)
router.put(
  "/admin-info/update-password",
  authenticateJWT,
  authorizeRole("admin"),
  userController.updateAdminPassword
);

router.put(
  "/admin-info/update-avatar",
  authenticateJWT,
  authorizeRole("admin"),
  userController.updateAdminAvatar
);
// routes/user.js
router.post(
  "/create",
  authenticateJWT,
  authorizeRole("admin"),
  userController.createUser
);
router.get("/admin", authenticateJWT, userController.getAdmin);

// Các route liên quan đến favorites
router.post("/favorites", authenticateJWT, userController.addFavorite);
router.get("/favorites", authenticateJWT, userController.getFavorites);
// routes/user.js
router.delete(
  "/favorites/:roomId",
  authenticateJWT,
  userController.removeFavorite
);

module.exports = router;
