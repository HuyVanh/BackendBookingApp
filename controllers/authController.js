// controllers/authController.js
const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Controller đăng ký người dùng mới
 */
exports.register = async (req, res) => {
  try {
    const { username, password, email, phone_number } = req.body;

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại.' });
    }
    
    // Tạo người dùng mới
    const user = new User({
      username,
      password,
      email,
      phone_number,
    });
    await user.save();

    // Tạo hồ sơ người dùng
    const profile = new Profile({
      user: user._id,
      full_name: '',
      birthday: null,
      gender: 'Khác',
      phone_number: phone_number || '',
      profile_picture: '',
    });
    await profile.save();

    res.status(201).json({ message: 'Đăng ký thành công.' });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Controller đăng nhập người dùng
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm người dùng theo tên đăng nhập
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }

    // Tạo JWT
    const token = jwt.sign(
      { user_id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id; // Lấy user_id từ middleware authenticateJWT
    const { username, email, phone_number, birthDate } = req.body;

    // Kiểm tra nếu username đã được sử dụng bởi người khác
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Tên đăng nhập đã được sử dụng.' });
      }
    }

    // Cập nhật thông tin User
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, phone_number },
      { new: true, runValidators: true }
    ).select('-password'); // Không trả về mật khẩu

    // Cập nhật thông tin Profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { birthday: birthDate },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Cập nhật thông tin thành công.',
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
// Thêm vào cùng với các exports khác
exports.getProfile = async (req, res) => {
  try {
    // Lấy thông tin user từ token (req.user.user_id đã được set trong middleware)
    const user = await User.findById(req.user.user_id)
      .select('-password') // Không trả về password
      .populate('favorites'); // Nếu cần populate thêm thông tin

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng.' 
      });
    }

    // Lấy thêm thông tin profile nếu cần
    const profile = await Profile.findOne({ user: req.user.user_id });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        profile: profile ? profile.toObject() : null
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy thông tin profile.' 
    });
  }
};
// controllers/authController.js

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    // Xác thực token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.email !== email) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ.'
      });
    }

    // Tìm user và cập nhật mật khẩu
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng.'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    // Xóa tất cả OTP của user này
    await OTP.deleteMany({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu.'
    });
  }
};
