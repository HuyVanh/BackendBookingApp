/**
 * Middleware phân quyền người dùng
 * @param {Boolean} requiredAdmin - Có yêu cầu quyền admin hay không
 */
module.exports = (requiredAdmin = false) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    // Kiểm tra quyền admin
    if (requiredAdmin && !user.isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    next();
  };
};
