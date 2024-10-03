const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.createPayment = async (req, res) => {
  try {
    const { booking_id, payment_method_id } = req.body;

    // Kiểm tra đặt phòng tồn tại và chưa có thanh toán
    const booking = await Booking.findById(booking_id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const existingPayment = await Payment.findOne({ booking: booking_id });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this booking.' });
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
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('payment_method');
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });

    // Kiểm tra quyền truy cập
    if (payment.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });

    // Kiểm tra quyền truy cập
    if (payment.user.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    payment.status = status;
    await payment.save();

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
