// controllers/bookingController.js
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { validationResult } = require('express-validator');
const Notification = require('../models/Notification');

// Lấy danh sách đặt phòng của người dùng
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.user_id })
      .populate({
        path: 'room',
        select: 'room_name address price room_images hotel'
      })
      .sort({ createdAt: -1 }); 

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Lấy danh sách tất cả các đặt phòng (chỉ admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room')
      .populate('user')
      .populate({
        path: 'ticket',
        populate: {
          path: 'scan_history.scanned_by',
          select: 'username full_name'
        }
      });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Lỗi khi lấy tất cả đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Lấy chi tiết đặt phòng theo ID
// Lấy chi tiết đặt phòng theo ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room').populate('user');
    
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }

    // Cho phép truy cập nếu là:
    // 1. Chủ booking
    // 2. Admin
    // 3. Staff
    if (booking.user.toString() !== req.user._id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'staff') {
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
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('room')  // Thêm populate để lấy thông tin phòng
      .populate('user'); // Thêm populate để lấy thông tin user

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }

    booking.status = status;
    await booking.save();

    // Nếu status là confirmed, tạo thông báo
    if (status === 'confirmed') {
      const notification = new Notification({
        user: booking.user._id,
        title: 'Đặt phòng đã được xác nhận',
        content: `Đặt phòng ${booking.room.room_name} của bạn đã được xác nhận`,
        type: 'success'
      });
      await notification.save();
    }

    res.status(200).json({ message: 'Cập nhật trạng thái thành công.', booking });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// Hủy đặt phòng - chỉ admin hoặc người dùng đã đặt phòng
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }

    // Log để kiểm tra cấu trúc của req.user
    console.log('req.user:', req.user);
    console.log('booking.user:', booking.user);

    // Sửa lại phần kiểm tra quyền
    const userId = req.user.user_id || req.user._id; // Thử cả hai trường hợp
    
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền hủy đặt phòng này.' });
    }

    // Cập nhật trạng thái hủy
    booking.status = 'canceled';
    booking.status_history.push({ 
      status: 'canceled',
      timestamp: new Date()
    });

    await booking.save();

    res.status(200).json({ message: 'Hủy đặt phòng thành công.', booking });
  } catch (error) {
    console.error('Lỗi chi tiết:', error);
    console.error('req.user:', req.user);
    res.status(500).json({ message: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
  }
};

// Tạo đặt phòng mới với kiểm tra dữ liệu
exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { room_id, check_in, check_out, guests_count, personal_info, price } = req.body;
  const userId = req.user.user_id;

  try {
    // Kiểm tra tình trạng phòng trước khi tạo booking
    const overlappingBookings = await Booking.findOne({
      room: room_id,
      status: { $ne: 'canceled' },
      $or: [
        {
          check_in: { $lt: new Date(check_out), $gte: new Date(check_in) }
        },
        {
          check_out: { $gt: new Date(check_in), $lte: new Date(check_out) }
        },
        {
          check_in: { $lte: new Date(check_in) },
          check_out: { $gte: new Date(check_out) }
        }
      ]
    });

    if (overlappingBookings) {
      return res.status(400).json({
        success: false,
        message: 'Phòng đã được đặt trong khoảng thời gian này'
      });
    }

    // Tiếp tục tạo booking nếu phòng khả dụng
    const newBooking = new Booking({
      user: userId,
      room: room_id,
      check_in: new Date(check_in),
      check_out: new Date(check_out),
      guests_count,
      personal_info,
      price,
      status_history: [{ status: 'pending' }],
      payment_status: req.body.payment_status || 'unpaid',
    });

    await newBooking.save();

    res.status(201).json({
      success: true,
      message: 'Đặt phòng thành công',
      booking: newBooking
    });

  } catch (error) {
    console.error('Lỗi khi tạo đặt phòng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};
exports.updateBookingPayment = async (req, res) => {
  try {
    const { payment_status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }

    booking.payment_status = payment_status;
    await booking.save();

    res.status(200).json({ message: 'Cập nhật trạng thái thanh toán thành công.', booking });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
    res.status(500).json({ message: 'Lỗi hệ thống.' });
  }
};
// Kiểm tra tình trạng phòng
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { check_in, check_out } = req.query;

    // Kiểm tra các tham số đầu vào
    if (!check_in || !check_out) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp thời gian check-in và check-out'
      });
    }

    const overlappingBookings = await Booking.findOne({
      room: roomId,
      status: { $ne: 'canceled' }, // Không tính các booking đã hủy
      $or: [
        {
          // Booking bắt đầu trong khoảng thời gian này
          check_in: {
            $lt: new Date(check_out),
            $gte: new Date(check_in)
          }
        },
        {
          // Booking kết thúc trong khoảng thời gian này
          check_out: {
            $gt: new Date(check_in),
            $lte: new Date(check_out)
          }
        },
        {
          // Booking bao trùm khoảng thời gian này
          check_in: { $lte: new Date(check_in) },
          check_out: { $gte: new Date(check_out) }
        }
      ]
    }).populate('room', 'room_name');

    if (overlappingBookings) {
      return res.json({
        success: false,
        available: false,
        message: 'Phòng đã được đặt trong khoảng thời gian này',
        conflict: {
          check_in: overlappingBookings.check_in,
          check_out: overlappingBookings.check_out
        }
      });
    }

    res.json({
      success: true,
      available: true,
      message: 'Phòng khả dụng trong khoảng thời gian này'
    });

  } catch (error) {
    console.error('Lỗi khi kiểm tra tình trạng phòng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};
