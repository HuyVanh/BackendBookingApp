const Booking = require('../models/Booking');
const Room = require('../models/Room');
const CancelBooking = require('../models/CancelBooking');

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.user_id })
      .populate('room');
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { room_id, check_in, check_out, guests_count } = req.body;

    // Kiểm tra phòng tồn tại
    const room = await Room.findById(room_id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    // Kiểm tra ngày check-in và check-out hợp lệ
    if (new Date(check_in) >= new Date(check_out)) {
      return res.status(400).json({ message: 'Check-out phải sau check-in.' });
    }

    // Tạo đặt phòng mới
    const booking = new Booking({
      user: req.user.user_id,
      room: room_id,
      check_in,
      check_out,
      guests_count,
      status_history: [{ status: 'pending' }],
    });
    await booking.save();

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'username email');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    // Kiểm tra xem booking có thuộc về người dùng hiện tại không
    if (booking.user._id.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    // Cập nhật trạng thái
    booking.status_history.push({ status });
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { reason, refund_amount } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    // Kiểm tra quyền hủy đặt phòng
    if (booking.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Cập nhật trạng thái đặt phòng
    booking.status_history.push({ status: 'canceled' });
    await booking.save();

    // Lưu thông tin hủy đặt phòng
    const cancelBooking = new CancelBooking({
      booking: booking._id,
      reason,
      refund_amount,
    });
    await cancelBooking.save();

    res.status(200).json({ message: 'Booking canceled successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
