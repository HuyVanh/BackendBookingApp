const Notification = require('../models/Notification');

exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, content, type } = req.body;

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
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.user_id })
      .sort({ created_at: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });

    // Kiểm tra quyền truy cập
    if (notification.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });

    // Kiểm tra quyền truy cập
    if (notification.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await notification.remove();
    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
