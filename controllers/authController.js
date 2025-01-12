// controllers/authController.js
const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

/**
 * Controller đăng ký người dùng mới
 */
exports.register = async (req, res) => {
  try {
    const { username, password, email, phone_number, fullName } = req.body;

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc email đã tồn tại.' });
    }
    
    // Tạo người dùng mới với fullName từ request
    const user = new User({
      username,
      password,
      email,
      phone_number,
      fullName  // Thêm fullName vào đây
    });
    await user.save();

    // Tạo hồ sơ người dùng, đồng bộ fullName với user
    const profile = new Profile({
      user: user._id,
      full_name: fullName,  // Sử dụng fullName từ request
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
    const { username, email, phone_number, birthDate, fullName } = req.body;

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
      { username, email, phone_number, fullName }, // Thêm fullName vào đây
      { new: true, runValidators: true }
    ).select('-password');

    // Cập nhật thông tin Profile và đồng bộ fullName
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { 
        birthday: birthDate,
        full_name: fullName // Đồng bộ fullName với Profile
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ.' 
    });
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
// Trong authController.js
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Tìm và cập nhật user với findOneAndUpdate thay vì findOne
      const user = await User.findOneAndUpdate(
        { email }, 
        { $set: { password: newPassword } },
        { 
          new: true,          // Trả về document sau khi update
          runValidators: false // Không chạy validators khi update
        }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công.'
      });

    } catch (jwtError) {
      console.error('JWT Error:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.'
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu.'
    });
  }
};

// controllers/authController.js
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin.'
      });
    }

    // Tìm user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng.'
      });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng.'
      });
    }

    // Hash và update mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công.'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ.'
    });
  }
};
