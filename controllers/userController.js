// controllers/userController.js
const User = require('../models/User');
const Profile = require('../models/Profile');
const Room = require('../models/Room');
const multer = require('multer');
const path = require('path');
const { cloudinary } = require('../config/cloudinary');

/**
 * Lấy danh sách tất cả người dùng (không bao gồm admin)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Chỉ cho phép admin truy cập
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    // Thêm điều kiện vào truy vấn để loại bỏ admin
    const users = await User.find({ role: 'user' }).select('-password'); // Loại bỏ mật khẩu khỏi kết quả
    res.status(200).json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
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
    const { roomId } = req.params; // <-- lấy từ params thay vì body

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Kiểm tra xem roomId có tồn tại trong favorites không
    if (user.favorites.includes(roomId)) {
      user.favorites = user.favorites.filter(id => id.toString() !== roomId);
      await user.save();
    }

    res.status(200).json({ message: 'Đã xóa phòng khỏi yêu thích.' });
  } catch (error) {
    console.error('Lỗi khi xóa phòng khỏi yêu thích:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Thay đổi trạng thái hoạt động của người dùng
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    // Chỉ cho phép admin truy cập
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Không cho phép admin tự vô hiệu hóa tài khoản của mình
    if (user._id.equals(req.user.user_id)) {
      return res.status(400).json({ message: 'Không thể thay đổi trạng thái của chính mình.' });
    }

    // Sử dụng findByIdAndUpdate thay vì save()
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: !user.isActive },
      { 
        new: true,      // Trả về document sau khi update
        runValidators: false  // Không chạy validation
      }
    );

    res.status(200).json({
      message: 'Cập nhật trạng thái người dùng thành công.',
      user: updatedUser
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Lấy danh sách nhân viên (chỉ admin)
 */
exports.getStaffList = async (req, res) => {
  try {
    const staffList = await User.find({ role: 'staff' }).select('-password');
    res.status(200).json(staffList);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Tạo nhân viên mới (chỉ admin)
 */
exports.createStaff = async (req, res) => {
  try {
    const { username, password, email, phone_number, avatar} = req.body;

    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username hoặc email đã tồn tại.' });
    }

    // Tạo người dùng mới với vai trò 'staff'
    const newStaff = new User({
      username,
      password,
      email,
      phone_number,
      role: 'staff',
      avatar: avatar ,
    });

    // Lưu người dùng vào cơ sở dữ liệu
    await newStaff.save();

    res.status(201).json({ message: 'Tạo nhân viên thành công.', user: newStaff });
  } catch (error) {
    console.error('Lỗi khi tạo nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Cập nhật thông tin nhân viên (chỉ admin)
 */
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, phone_number, isActive } = req.body;

    const staff = await User.findById(id);

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    // Cập nhật thông tin
    if (email) staff.email = email;
    if (phone_number) staff.phone_number = phone_number;
    if (typeof isActive !== 'undefined') staff.isActive = isActive;

    await staff.save();

    res.status(200).json({ message: 'Cập nhật thông tin nhân viên thành công.', user: staff });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
/// Lấy thông tin chi tiết nhân viên (chỉ admin)
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findById(id).select('-password'); // Không trả về password

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chi tiết nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Bật/Tắt trạng thái hoạt động của nhân viên (chỉ admin)
 */
exports.toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem user có tồn tại và có phải là staff không
    const staff = await User.findOne({ _id: id, role: 'staff' });
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    // Sử dụng findByIdAndUpdate thay vì save() để tránh validation
    const updatedStaff = await User.findByIdAndUpdate(
      id,
      { isActive: !staff.isActive },
      { 
        new: true,         // Trả về document đã được update
        runValidators: false // Không chạy validation
      }
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    res.status(200).json({ 
      message: 'Cập nhật trạng thái nhân viên thành công.',
      user: updatedStaff 
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái nhân viên:', error);
    res.status(500).json({ 
      message: 'Lỗi khi cập nhật trạng thái nhân viên.',
      error: error.message 
    });
  }
};
/**
 * Cập nhật avatar cho người dùng
 * Người dùng có thể cập nhật avatar của chính mình
 */
// controllers/userController.js
// controllers/userController.js
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.user_id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh.'
      });
    }

    // Lấy URL từ Cloudinary
    const avatarUrl = req.file.path;

    // Cập nhật user với URL avatar mới
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật avatar thành công.',
      data: {
        avatar: avatarUrl,
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật avatar.'
    });
  }
};


// Lấy thông tin admin (chỉ admin)
exports.getAdminInfo = async (req, res) => {
  try {
    console.log('User requesting admin info:', req.user);
    const adminId = req.user.user_id;
    console.log('Admin ID:', adminId);

    const admin = await User.findById(adminId).select('-password');
    console.log('Found admin:', admin);

    if (!admin || admin.role !== 'admin') {
      console.log('Role check failed:', admin?.role);
      return res.status(403).json({ message: 'Không tìm thấy admin hoặc bạn không phải admin.' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error('Chi tiết lỗi:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Đổi mật khẩu admin (chỉ admin)
exports.updateAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp.' });
    }

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không phải admin.' });
    }

    // Cập nhật mật khẩu mới
    admin.password = newPassword;
    await admin.save(); // userSchema.pre('save') sẽ tự động hash mật khẩu

    res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu admin:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
exports.updateAdminAvatar = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const { avatar } = req.body;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không phải admin.' });
    }

    admin.avatar = avatar;
    await admin.save();

    res.status(200).json({ message: 'Cập nhật avatar thành công.', user: admin });
  } catch (error) {
    console.error('Lỗi khi cập nhật avatar admin:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { username, password, email, phone_number, role, isActive, avatar } = req.body;

    // Kiểm tra trùng lặp username hoặc email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username hoặc email đã tồn tại.' });
    }

    const newUser = new User({
      username,
      password,
      email,
      phone_number,
      role, // role: 'admin'
      isActive,
      avatar,
    });

    await newUser.save();

    res.status(201).json({ message: 'Tạo người dùng thành công.', user: newUser });
  } catch (error) {
    console.error('Lỗi khi tạo người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
exports.getAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy admin' 
      });
    }
    
    res.json({ 
      success: true, 
      user: {
        _id: admin._id,
        username: admin.username,
      } 
    });
  } catch (error) {
    console.error('Error getting admin:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};






