const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');


const verifyTicket = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const staffId = req.user._id;

    let qrData;
    try {
      qrData = typeof qrCode === 'string' ? JSON.parse(qrCode) : qrCode;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'QR code không hợp lệ'
      });
    }

    // Tìm vé và update trạng thái
    const ticket = await Ticket.findOne({ 
      booking: qrData.bookingId,
      is_used: false 
    });

    if (!ticket) {
      return res.status(400).json({
        success: false,
        message: 'Vé không hợp lệ hoặc đã được sử dụng'
      });
    }

    // Cập nhật trạng thái vé
    ticket.is_used = true;
    ticket.scan_history.push({
      scanned_at: new Date(),
      scanned_by: staffId
    });

    await ticket.save();

    // Cập nhật booking
    await Booking.findByIdAndUpdate(
      qrData.bookingId,
      {
        $set: {
          ticket: ticket._id,
          status: 'confirmed',
          'status_history': [
            ...ticket.status_history || [],
            { status: 'confirmed', timestamp: new Date() }
          ]
        }
      },
      { new: true }
    );

    // Populate đầy đủ thông tin
    await ticket.populate([
      {
        path: 'booking',
        populate: ['user', 'room']
      },
      {
        path: 'scan_history.scanned_by',
        select: 'username full_name'
      }
    ]);

    res.json({
      success: true,
      message: 'Xác thực vé thành công',
      ticket
    });

  } catch (error) {
    console.error('Error in verifyTicket:', error);
    res.status(500).json({
      success: false, 
      message: 'Lỗi server'
    });
  }
};

// Thêm hàm getScanHistory
const getScanHistory = async (req, res) => {
  try {
    const staffId = req.user._id;

    // Tìm tất cả vé đã được quét bởi nhân viên này
    const tickets = await Ticket.find({
      'scan_history.scanned_by': staffId
    })
    .populate({
      path: 'booking',
      select: 'personal_info check_in check_out'
    })
    .populate({
      path: 'scan_history.scanned_by',
      select: 'username full_name'
    })
    .sort({ 'scan_history.scanned_at': -1 });

    // Format dữ liệu trả về
    const formattedHistory = tickets.map(ticket => {
      const scanRecord = ticket.scan_history.find(
        record => record.scanned_by._id.toString() === staffId.toString()
      );

      return {
        _id: ticket._id,
        ticketId: ticket._id,
        bookingId: ticket.booking._id,
        guestName: ticket.booking.personal_info.full_name,
        phoneNumber: ticket.booking.personal_info.phone_number,
        checkIn: ticket.booking.check_in,
        checkOut: ticket.booking.check_out,
        scannedAt: scanRecord.scanned_at,
        scannedBy: {
          id: scanRecord.scanned_by._id,
          name: scanRecord.scanned_by.full_name || scanRecord.scanned_by.username
        },
        status: ticket.is_used ? 'Đã sử dụng' : 'Chưa sử dụng'
      };
    });

    res.json({
      success: true,
      data: formattedHistory
    });

  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử quét vé'
    });
  }
};

module.exports = {
  verifyTicket,
  getScanHistory
};