const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware xác thực người dùng
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Thiếu token truy cập' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Thiếu token truy cập' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Lỗi xác thực token:', err);
      return res.status(403).json({ message: 'Token không hợp lệ' });
    }

    req.user = user; // Thêm thông tin người dùng vào req
    next();
  });
};
