// controllers/bookingController.js

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const CancelBooking = require('../models/CancelBooking');
const { validationResult } = require('express-validator');
const Notification = require('../models/Notification');


/**
 * Hàm lấy danh sách đặt phòng của người dùng hiện tại
 * 
 * @param {Object} req - Đối tượng yêu cầu HTTP
 * @param {Object} res - Đối tượng phản hồi HTTP
 */
exports.getUserBookings = async (req, res) => {
  try {
    // Tìm tất cả các đặt phòng của người dùng dựa trên user_id trong token
    const bookings = await Booking.find({ user: req.user.user_id })
      .populate('room'); // Lấy thông tin chi tiết của phòng được đặt

    // Trả về danh sách đặt phòng
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    // Trả về lỗi máy chủ nếu có lỗi xảy ra
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};


/**
 * Hàm tạo một đặt phòng mới
 */
exports.createBooking = async (req, res) => {
  // Kiểm tra kết quả xác thực
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Trả về lỗi nếu dữ liệu không hợp lệ
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    // Kiểm tra giá trị của req.user
    console.log('Thông tin req.user:', req.user);
    const {
      room_id,
      check_in,
      check_out,
      guests_count,
      personal_info,
    } = req.body;

    // Chuyển đổi ngày check-in và check-out thành đối tượng Date
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    // Kiểm tra phòng tồn tại
    const room = await Room.findById(room_id);
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng.' });

    // Kiểm tra ngày check-in và check-out hợp lệ
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Ngày check-out phải sau ngày check-in.' });
    }

    // Kiểm tra phòng trống
    const overlappingBookings = await Booking.findOne({
      room: room_id,
      status: { $ne: 'canceled' }, // Loại trừ các đặt phòng đã hủy
      $or: [
        {
          check_in: { $lt: checkOutDate },
          check_out: { $gt: checkInDate },
        },
      ],
    });

    if (overlappingBookings) {
      return res.status(400).json({ message: 'Phòng đã được đặt trong khoảng thời gian này.' });
    }

    // Tính số đêm ở
    const timeDiff = checkOutDate - checkInDate;
    const numberOfNights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (numberOfNights <= 0) {
      return res.status(400).json({ message: 'Số đêm ở phải lớn hơn 0.' });
    }

    // Tính giá tiền
    const totalPrice = room.price * numberOfNights;

    // Tạo đặt phòng mới với thông tin cá nhân và giá tiền
    const booking = new Booking({
      user: req.user.user_id,
      room: room_id,
      check_in: checkInDate,
      check_out: checkOutDate,
      guests_count,
      status_history: [{ status: 'pending' }],
      personal_info,
      price: totalPrice, // Lưu giá tiền vào đây
    });

    await booking.save();
    console.log('Đặt phòng đã được lưu:', booking);
    console.log('Bắt đầu tạo thông báo cho người dùng:', req.user.user_id);

    // **Tạo thông báo cho người dùng**
    const notification = new Notification({
      user: req.user.user_id,
      title: 'Đặt phòng thành công',
      content: `Bạn đã đặt phòng thành công từ ngày ${check_in} đến ${check_out} tại phòng ${room.room_name}`,
      type: 'success',
    });
    await notification.save();
    console.log('Thông báo đã được lưu:', notification);

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};




/**
 * Hàm lấy chi tiết một đặt phòng theo ID
 * 
 * @param {Object} req - Đối tượng yêu cầu HTTP chứa ID đặt phòng
 * @param {Object} res - Đối tượng phản hồi HTTP
 */
exports.getBookingById = async (req, res) => {
  try {
    // Tìm đặt phòng theo ID và lấy thông tin phòng và người dùng liên quan
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'username email _id'); // Chỉ lấy các trường cần thiết

    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });

    // Kiểm tra xem đặt phòng có thuộc về người dùng hiện tại không
    if (booking.user._id.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    // Trả về thông tin chi tiết của đặt phòng
    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    // Trả về lỗi máy chủ nếu có lỗi xảy ra
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm cập nhật trạng thái của một đặt phòng (chỉ dành cho admin)
 * 
 * @param {Object} req - Đối tượng yêu cầu HTTP chứa thông tin trạng thái mới
 * @param {Object} res - Đối tượng phản hồi HTTP
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Tìm đặt phòng theo ID
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });

    // Cập nhật trạng thái mới vào lịch sử trạng thái
    booking.status_history.push({ status });

    // Cập nhật trạng thái hiện tại của đặt phòng
    booking.status = status;

    // Lưu thay đổi vào cơ sở dữ liệu
    await booking.save();

    // Trả về thông tin đặt phòng sau khi cập nhật
    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    // Trả về lỗi máy chủ nếu có lỗi xảy ra
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm hủy một đặt phòng (dành cho người dùng hoặc admin)
 * 
 * @param {Object} req - Đối tượng yêu cầu HTTP chứa lý do hủy và số tiền hoàn trả
 * @param {Object} res - Đối tượng phản hồi HTTP
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { reason, refund_amount } = req.body;

    // Tìm đặt phòng theo ID
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });

    // Kiểm tra quyền hủy đặt phòng (người dùng sở hữu hoặc admin)
    if (booking.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    // Thêm trạng thái 'canceled' vào lịch sử trạng thái
    booking.status_history.push({ status: 'canceled' });

    // Cập nhật trạng thái hiện tại của đặt phòng
    booking.status = 'canceled';

    // Lưu thay đổi vào cơ sở dữ liệu
    await booking.save();

    // Tạo một bản ghi hủy đặt phòng
    const cancelBooking = new CancelBooking({
      booking: booking._id, // ID của đặt phòng bị hủy
      reason,               // Lý do hủy
      refund_amount,        // Số tiền hoàn trả
    });

    // Lưu thông tin hủy đặt phòng vào cơ sở dữ liệu
    await cancelBooking.save();

    // Trả về thông báo hủy đặt phòng thành công
    res.status(200).json({ message: 'Hủy đặt phòng thành công.' });
  } catch (error) {
    console.error(error);
    // Trả về lỗi máy chủ nếu có lỗi xảy ra
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
