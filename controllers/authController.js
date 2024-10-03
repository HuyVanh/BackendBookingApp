const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.register = async (req, res) => {
  try {
    const { username, password, email, phone_number } = req.body;

    // Kiểm tra người dùng đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username hoặc email đã tồn tại.' });
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
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm người dùng theo username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Tạo JWT
    const token = jwt.sign(
      { user_id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
