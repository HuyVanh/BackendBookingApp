// controllers/ticketController.js
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const QRCode = require('qrcode');


// Thêm function mới này
exports.getTicketByBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;
    console.log('Finding ticket for booking:', booking_id);

    // Tìm ticket và populate thông tin booking
    const ticket = await Ticket.findOne({ booking: booking_id })
      .populate({
        path: 'booking',
        select: 'check_in check_out guests_count personal_info room payment_status'
      });

    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé.' });
    }

    // Kiểm tra quyền truy cập
    if (ticket.user.toString() !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    // Format dữ liệu trước khi trả về
    const formattedTicket = {
      _id: ticket._id,
      qr_code: ticket.qr_code,
      is_used: ticket.is_used,
      booking: {
        _id: ticket.booking._id,
        check_in: ticket.booking.check_in,
        check_out: ticket.booking.check_out,
        guests_count: ticket.booking.guests_count,
        personal_info: ticket.booking.personal_info,
        payment_status: ticket.booking.payment_status
      }
    };

    console.log('Returning ticket data:', formattedTicket);
    res.json(formattedTicket);

  } catch (error) {
    console.error('Error getting ticket by booking:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Kiểm tra vé đã được sử dụng hay chưa
 */
exports.checkTicketUsage = async (req, res) => {
    try {
      const { booking_id } = req.params;
  
      // Tìm vé theo booking_id
      const ticket = await Ticket.findOne({ booking: booking_id });
  
      if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé.' });
  
      // Trả về trạng thái sử dụng của vé
      res.status(200).json({
        booking_id: ticket.booking,
        is_used: ticket.is_used,
      });
    } catch (error) {
      console.error('Error checking ticket usage:', error);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  };

  /**
 * Đánh dấu vé là đã sử dụng
 */
exports.markTicketAsUsed = async (req, res) => {
    try {
      const { booking_id } = req.params;
  
      // Tìm vé theo booking_id
      const ticket = await Ticket.findOne({ booking: booking_id });
  
      if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé.' });
  
      // Kiểm tra xem vé đã được sử dụng chưa
      if (ticket.is_used) {
        return res.status(400).json({ message: 'Vé đã được sử dụng.' });
      }
  
      // Đánh dấu vé là đã sử dụng
      ticket.is_used = true;
      await ticket.save();
  
      // Trả về thông tin vé sau khi cập nhật
      res.status(200).json({
        message: 'Vé đã được đánh dấu là đã sử dụng.',
        ticket,
      });
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  };


/**
 * Kiểm tra vé bằng mã QR và đánh dấu là đã sử dụng
 */
exports.checkTicketByQRCode = async (req, res) => {
  try {
    const { qr_code } = req.body;

    // Tìm vé theo mã QR
    const ticket = await Ticket.findOne({ qr_code: qr_code });

    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé.' });

    // Kiểm tra xem vé đã được sử dụng chưa
    if (ticket.is_used) {
      return res.status(400).json({ message: 'Vé đã được sử dụng.' });
    }

    // Đánh dấu vé là đã sử dụng
    ticket.is_used = true;

    // Thêm vào lịch sử quét vé
    ticket.scan_history.push({
      scanned_at: new Date(),
      scanned_by: req.user.user_id, // ID của nhân viên quét vé
    });

    await ticket.save();

    // Trả về thông tin vé
    res.status(200).json({
      message: 'Vé hợp lệ và đã được đánh dấu là đã sử dụng.',
      ticket,
    });
  } catch (error) {
    console.error('Error checking ticket by QR code:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

  

/**
 * Tạo vé cho một đặt phòng đã được thanh toán
 */
exports.createTicket = async (req, res) => {
  try {
    const { booking_id } = req.params;
    console.log('Creating ticket for booking:', booking_id);

    // Kiểm tra đặt phòng tồn tại
    const booking = await Booking.findById(booking_id).populate('user');
    if (!booking) {
      console.log('Booking not found');
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }

    console.log('Found booking:', {
      id: booking._id,
      user: booking.user._id,
      currentUser: req.user.user_id
    });

    // Kiểm tra quyền truy cập
    if (booking.user._id.toString() !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    // Kiểm tra vé đã được tạo trước đó chưa
    const existingTicket = await Ticket.findOne({ booking: booking_id });
    if (existingTicket) {
      
      return res.status(400).json({ message: 'Vé cho đặt phòng này đã được tạo.' });
    }

    // Tạo dữ liệu cho QR code
    const qrData = JSON.stringify({
      bookingId: booking._id,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      guestsCount: booking.guests_count,
      fullName: booking.personal_info.full_name,
      phoneNumber: booking.personal_info.phone_number
    });
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    try {
      const qrCode = await QRCode.toDataURL(qrData);

      // Tạo vé mới
      const ticket = new Ticket({
        booking: booking._id,
        user: booking.user._id,
        qr_code: qrCode,
        qr_data: qrData,
        is_used: false
      });

      await ticket.save();
      

      res.status(201).json(ticket);
    } catch (qrError) {
      res.status(500).json({ message: 'Không thể tạo mã QR.' });
    }

  } catch (error) {
  
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Lấy thông tin vé
 */
exports.getTicket = async (req, res) => {
  try {
    const { booking_id } = req.params;

    // Tìm vé theo booking_id
    const ticket = await Ticket.findOne({ booking: booking_id }).populate({
      path: 'booking',
      populate: { path: 'room' },
    });

    if (!ticket) return res.status(404).json({ message: 'Không tìm thấy vé.' });

    // Kiểm tra quyền truy cập
    if (ticket.user.toString() !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    // Trả về thông tin vé
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
// controllers/ticketController.js

/**
 * Lấy lịch sử quét vé
 */
exports.getScanHistory = async (req, res) => {
  try {
    // Tìm tất cả các vé đã được quét (is_used = true)
    const tickets = await Ticket.find({ is_used: true })
      .populate('booking')
      .populate('user', 'username email')
      .populate('scan_history.scanned_by', 'username');

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

