// controllers/userController.js
const Profile = require('../models/Profile');

/**
 * Controller lấy hồ sơ người dùng
 */
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.user_id }).populate('user', '-password');
    if (!profile) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ người dùng.' });
    }
    res.status(200).json({ profile });
  } catch (error) {
    console.error('Lỗi khi lấy hồ sơ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
