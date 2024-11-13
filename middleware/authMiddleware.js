// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware xác thực người dùng bằng JWT
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Thiếu token truy cập.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Thiếu token truy cập.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Lỗi xác thực token:', err);
      return res.status(403).json({ message: 'Token không hợp lệ.' });
    }

    req.user = user; // Thêm thông tin người dùng vào req
    next();
  });
};

/**
 * Middleware phân quyền người dùng dựa trên vai trò
 * @param {String} requiredRole - Vai trò yêu cầu (ví dụ: 'admin')
 */
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Chưa xác thực.' });
    }

    if (requiredRole && user.role !== requiredRole) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
    }

    next();
  };
};

module.exports = { authenticateJWT, authorizeRole };
