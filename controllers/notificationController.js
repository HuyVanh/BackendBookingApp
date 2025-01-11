const Notification = require('../models/Notification');

/**
 * Tạo thông báo mới
 * Chỉ admin mới được phép tạo thông báo cho người dùng khác
 */
exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, content, type } = req.body;

    // Kiểm tra quyền hạn: chỉ admin mới được tạo thông báo
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền tạo thông báo.' });
    }

    const notification = new Notification({
      user: user_id,
      title,
      content,
      type,
    });
    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Lấy danh sách thông báo của người dùng
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.user_id }).sort({ created_at: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Đánh dấu thông báo là đã đọc
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo.' });

    // Kiểm tra quyền truy cập
    if (notification.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Xóa thông báo
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo.' });

    // Kiểm tra quyền truy cập
    if (notification.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    await notification.remove();
    res.status(200).json({ message: 'Xóa thông báo thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
// Trong notificationController.js
exports.createBookingNotification = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const notification = new Notification({
      user: req.user.user_id,
      title,
      content,
      type,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.user_id, is_read: false },
      { $set: { is_read: true } }
    );
    res.status(200).json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
