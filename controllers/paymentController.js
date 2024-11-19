// controllers/paymentController.js
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');

exports.createPayment = async (req, res) => {
  try {
    const { booking_id, payment_method_id } = req.body;

    // Kiểm tra đặt phòng tồn tại và chưa có thanh toán
    const booking = await Booking.findById(booking_id);
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });

    const existingPayment = await Payment.findOne({ booking: booking_id });
    if (existingPayment) {
      return res.status(400).json({ message: 'Đặt phòng này đã được thanh toán.' });
    }

    // Tạo thanh toán mới
    const payment = new Payment({
      user: req.user.user_id,
      booking: booking_id,
      payment_method: payment_method_id,
      total_amount: booking.price,
      status: 'pending',
    });
    await payment.save();

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('payment_method');
    if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán.' });

    // Kiểm tra quyền truy cập
    if (payment.user.toString() !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Không tìm thấy thanh toán.' });

    // Cho phép admin cập nhật trạng thái
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    payment.status = status;
    await payment.save();

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
exports.createPayment = async (req, res) => {
  try {
    const { booking_id, payment_method_id } = req.body;

    // Kiểm tra đặt phòng tồn tại và chưa có thanh toán
    const booking = await Booking.findById(booking_id).populate('room').populate('user');
    if (!booking) return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });

    if (!booking.price) {
      return res.status(400).json({ message: 'Đặt phòng chưa có giá tiền.' });
    }

    const existingPayment = await Payment.findOne({ booking: booking_id });
    if (existingPayment) {
      return res.status(400).json({ message: 'Đặt phòng này đã được thanh toán.' });
    }

    // Tạo thanh toán mới
    const payment = new Payment({
      user: req.user.user_id,
      booking: booking_id,
      payment_method: payment_method_id,
      total_amount: booking.price,
      status: 'completed', // Giả sử thanh toán hoàn tất
      payment_date: new Date(),
    });
    await payment.save();

    // Tự động tạo vé sau khi thanh toán thành công
    // Kiểm tra vé đã được tạo chưa
    const existingTicket = await Ticket.findOne({ booking: booking_id });
    if (!existingTicket) {
      // Tạo mã QR chứa booking_id
      const qrData = booking._id.toString();
      const qrCode = await QRCode.toDataURL(qrData);

      // Tạo vé mới
      const ticket = new Ticket({
        booking: booking._id,
        user: booking.user._id,
        qr_code: qrCode,
        is_used: false,
      });
      await ticket.save();

      // Trả về thông tin thanh toán và vé
      res.status(201).json({
        payment,
        ticket,
      });
    } else {
      // Trả về thông tin thanh toán và vé đã tồn tại
      res.status(201).json({
        payment,
        ticket: existingTicket,
      });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
