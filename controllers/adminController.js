// controllers/adminController.js
const User = require('../models/User');

/**
 * Controller cho dashboard admin
 */
exports.dashboard = async (req, res) => {
  try {
    // Ví dụ: Lấy danh sách tất cả người dùng
    const users = await User.find().select('-password'); // Loại bỏ mật khẩu
    res.status(200).json({ users });
  } catch (error) {
    console.error('Lỗi khi lấy dashboard:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
