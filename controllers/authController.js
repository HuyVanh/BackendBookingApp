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
      { expiresIn: '1h' }
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
