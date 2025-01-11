// controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');
const PaymentMethod = require('../models/PaymentMethod');

/**
 * Tạo Payment với Stripe
 */
exports.createPayment = async (req, res) => {
  try {
    console.log('Starting create payment with data:', req.body);
    const { booking_id, payment_method_id } = req.body;

    // Log dữ liệu nhận được
    console.log('Received request data:', {
      booking_id,
      payment_method_id,
      userId: req.user.user_id
    });

    // 1. Kiểm tra booking
    const booking = await Booking.findById(booking_id)
      .populate('room')
      .populate('user');
    console.log('Found booking:', booking ? booking._id : 'Not found');

    if (!booking) {
      console.log('Booking not found for id:', booking_id);
      return res.status(404).json({ message: 'Không tìm thấy đặt phòng.' });
    }

    // 2. Log dữ liệu booking
    console.log('Booking price:', booking.price);

    // 3. Kiểm tra paymentMethod
    const paymentMethod = await PaymentMethod.findById(payment_method_id);
    console.log('Found payment method:', paymentMethod ? paymentMethod.method_type : 'Not found');

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Không tìm thấy phương thức thanh toán.' });
    }

    const methodType = paymentMethod.method_type;
    let paymentStatus = 'pending';
    let stripePaymentIntent = null;

    // 4. Tạo Stripe Payment Intent
    if (methodType === 'Stripe') {
      try {
        console.log('Creating Stripe payment intent for amount:', booking.price);
        stripePaymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(booking.price),
          currency: 'vnd',
          metadata: {
            booking_id: booking_id,
            user_id: req.user.user_id
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });
        console.log('Stripe payment intent created:', stripePaymentIntent.id);
      } catch (stripeError) {
        console.error('Stripe error details:', {
          type: stripeError.type,
          message: stripeError.message,
          code: stripeError.code
        });
        return res.status(400).json({ 
          message: 'Lỗi khi tạo Payment Intent',
          error: stripeError.message 
        });
      }
    }

    // 5. Log payment creation attempt
    console.log('Creating payment document');
    const payment = new Payment({
      user: req.user.user_id,
      booking: booking_id,
      payment_method: payment_method_id,
      total_amount: booking.price,
      status: paymentStatus,
      payment_date: paymentStatus === 'completed' ? new Date() : null,
      stripe_payment_intent_id: stripePaymentIntent?.id,
      stripe_client_secret: stripePaymentIntent?.client_secret,
    });

    await payment.save();
    console.log('Payment saved successfully:', payment._id);
    console.log('Final response data:', {
      payment: payment,
      payment_intent_id: stripePaymentIntent?.id,
      stripe_client_secret: stripePaymentIntent?.client_secret
    });

    return res.status(201).json({
      success: true,
      data: {
      payment: payment.toObject(),
      stripe_client_secret: stripePaymentIntent?.client_secret,
      stripe_payment_intent_id: stripePaymentIntent?.id
      },
      
    });

  } catch (error) {
    console.error('Server error in createPayment:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
// Xác nhận payment
exports.confirmPayment = async (req, res) => {
  try {
    const { payment_id, payment_intent_id } = req.body;
    
    const payment = await Payment.findById(payment_id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy payment.' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
      payment.payment_date = new Date();
      await payment.save();

      // Lấy thông tin booking
      const booking = await Booking.findById(payment.booking);

      // Tạo QR code
      const qrData = JSON.stringify({
        bookingId: booking._id,
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        guestsCount: booking.guests_count,
        fullName: booking.personal_info.full_name,
        phoneNumber: booking.personal_info.phone_number
      });

      const qrCode = await QRCode.toDataURL(qrData);

      // Tạo ticket mới với QR code
      const ticket = new Ticket({
        booking: booking._id,
        user: req.user.user_id,
        qr_code: qrCode,
        is_used: false
      });

      await ticket.save();

      res.json({ 
        status: 'success', 
        payment,
        ticket: {
          _id: ticket._id,
          qr_code: ticket.qr_code,
          booking: {
            check_in: booking.check_in,
            check_out: booking.check_out,
            guests_count: booking.guests_count,
            personal_info: booking.personal_info
          }
        }
      });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({ message: 'Thanh toán thất bại' });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

/**
 * Lấy payment by ID
 */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('payment_method');
    
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán.' });
    }

    if (payment.user.toString() !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Truy cập bị từ chối.' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Cập nhật trạng thái thanh toán từ client
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { payment_id, payment_intent_id } = req.body;

    // Verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status === 'succeeded') {
      // Find and update payment
      const payment = await Payment.findById(payment_id);
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      payment.status = 'completed';
      payment.payment_date = new Date();
      await payment.save();

      // Create ticket if not exists
      const existingTicket = await Ticket.findOne({ booking: payment.booking });
      if (!existingTicket) {
        const booking = await Booking.findById(payment.booking).populate('user');
        if (booking) {
          const qrCode = await QRCode.toDataURL(booking._id.toString());
          await Ticket.create({
            booking: booking._id,
            user: booking.user._id,
            qr_code: qrCode,
            is_used: false,
          });
        }
      }

      return res.json({ status: 'success', payment });
    } else {
      // Update payment status to failed if payment failed
      await Payment.findByIdAndUpdate(payment_id, { status: 'failed' });
      return res.status(400).json({ 
        message: 'Payment failed',
        status: paymentIntent.status 
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};