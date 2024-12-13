// controllers/userController.js
const User = require('../models/User');
const Profile = require('../models/Profile');
const Room = require('../models/Room'); // Import mô hình Room nếu cần

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
/**
 * Thay đổi trạng thái hoạt động của người dùng
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    // Chỉ cho phép admin truy cập
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Không cho phép admin tự vô hiệu hóa tài khoản của mình
    if (user._id.equals(req.user.user_id)) {
      return res.status(400).json({ message: 'Không thể thay đổi trạng thái của chính mình.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ message: 'Cập nhật trạng thái người dùng thành công.', user });
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
    const { username, password, email, phone_number } = req.body;

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
/**
 * Bật/Tắt trạng thái hoạt động của nhân viên (chỉ admin)
 */
exports.toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);

    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    // Thay đổi trạng thái isActive
    staff.isActive = !staff.isActive;
    await staff.save();

    res.status(200).json({ message: 'Cập nhật trạng thái nhân viên thành công.', user: staff });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
/**
 * Cập nhật avatar cho người dùng
 * Người dùng có thể cập nhật avatar của chính mình
 */
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { avatar } = req.body; // URL của ảnh mới

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

    user.avatar = avatar;
    await user.save();

    res.status(200).json({ message: 'Cập nhật avatar thành công.', user });
  } catch (error) {
    console.error('Lỗi khi cập nhật avatar:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Lấy thông tin admin hiện tại (chỉ admin)
 */
exports.getAdminInfo = async (req, res) => {
  try {
    const adminId = req.user.user_id; // user_id đã được gắn trong quá trình xác thực
    const admin = await User.findById(adminId).select('-password'); // Không trả về password

    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Không tìm thấy admin hoặc bạn không phải admin.' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin admin:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Lấy thông tin admin (chỉ admin)
exports.getAdminInfo = async (req, res) => {
  try {
    const adminId = req.user.user_id; 
    const admin = await User.findById(adminId).select('-password'); 
    // Không loại bỏ avatar, avatar sẽ hiển thị bình thường
    // Mặc định select('-password') chỉ bỏ password, avatar được giữ lại.

    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Không tìm thấy admin hoặc bạn không phải admin.' });
    }

    // admin sẽ chứa cả avatar: admin.avatar
    res.status(200).json(admin);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin admin:', error);
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






