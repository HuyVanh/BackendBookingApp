// controllers/bookingController.js
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { validationResult } = require('express-validator');

// Lấy danh sách đặt phòng của người dùng
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('room');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Lấy danh sách tất cả các đặt phòng (chỉ admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('room').populate('user');
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy tất cả đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Lấy chi tiết đặt phòng theo ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room').populate('user');
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }
    // Kiểm tra quyền truy cập
    if (booking.user.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Cập nhật trạng thái đặt phòng (chỉ admin)
exports.updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'confirmed', 'canceled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
  }

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }

    booking.status = status;
    booking.status_history.push({ status });

    await booking.save();

    res.status(200).json({ message: 'Cập nhật trạng thái thành công.', booking });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Hủy đặt phòng - chỉ admin hoặc người dùng đã đặt phòng
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }

    // Kiểm tra quyền hủy đặt phòng
    if (booking.user.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền hủy đặt phòng này.' });
    }

    // Cập nhật trạng thái hủy
    booking.status = 'canceled';
    booking.status_history.push({ status: 'canceled' });

    await booking.save();

    res.status(200).json({ message: 'Hủy đặt phòng thành công.', booking });
  } catch (error) {
    console.error('Lỗi khi hủy đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Tạo đặt phòng mới với kiểm tra dữ liệu
exports.createBooking = async (req, res) => {
  // Kiểm tra các lỗi từ express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  console.log('Authenticated User:', req.user);

  const { room_id, check_in, check_out, guests_count, personal_info, price } = req.body;
  const userId = req.user.user_id;

  try {
    // Kiểm tra xem phòng có tồn tại không
    const room = await Room.findById(room_id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng.' });
    }

    // Kiểm tra xem phòng còn trống trong khoảng thời gian được chọn không
    const overlappingBookings = await Booking.findOne({
      room: room_id,
      $or: [
        {
          check_in: { $lte: new Date(check_out), $gte: new Date(check_in) },
        },
        {
          check_out: { $lte: new Date(check_out), $gte: new Date(check_in) },
        },
        {
          check_in: { $lte: new Date(check_in) },
          check_out: { $gte: new Date(check_out) },
        },
      ],
    });

    if (overlappingBookings) {
      return res.status(400).json({ message: 'Phòng đã được đặt trong khoảng thời gian này.' });
    }

    // Tạo đơn đặt phòng mới
    const newBooking = new Booking({
      user: userId,
      room: room_id,
      check_in: new Date(check_in),
      check_out: new Date(check_out),
      guests_count,
      personal_info,
      price,
      status_history: [{ status: 'pending' }],
    });

    await newBooking.save();

    res.status(201).json({ message: 'Đặt phòng thành công.', booking: newBooking });
  } catch (error) {
    console.error('Lỗi khi tạo đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};
