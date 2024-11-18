// controllers/userController.js
const User = require('../models/User');
const Profile = require('../models/Profile');
const Room = require('../models/Room'); // Import mô hình Room nếu cần

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

/**
 * Thêm phòng vào danh sách yêu thích của người dùng
 */
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { roomId } = req.body;

    // Kiểm tra xem phòng có tồn tại không
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Kiểm tra xem phòng đã có trong danh sách yêu thích chưa
    if (!user.favorites.includes(roomId)) {
      user.favorites.push(roomId);
      await user.save();
    }

    res.status(200).json({ message: 'Đã thêm phòng vào yêu thích.' });
  } catch (error) {
    console.error('Lỗi khi thêm phòng vào yêu thích:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Lấy danh sách phòng yêu thích của người dùng
 */
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách yêu thích:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Xóa phòng khỏi danh sách yêu thích của người dùng
 */
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { roomId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Kiểm tra xem phòng có trong danh sách yêu thích không
    if (user.favorites.includes(roomId)) {
      user.favorites = user.favorites.filter((id) => id.toString() !== roomId);
      await user.save();
    }

    res.status(200).json({ message: 'Đã xóa phòng khỏi yêu thích.' });
  } catch (error) {
    console.error('Lỗi khi xóa phòng khỏi yêu thích:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
