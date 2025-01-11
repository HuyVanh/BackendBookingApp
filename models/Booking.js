// models/Booking.js
const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'canceled'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const personalInfoSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  // Bạn có thể thêm các trường khác nếu cần
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    booking_date: { type: Date, default: Date.now },
    check_in: { type: Date, required: true },
    check_out: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
    guests_count: { type: Number, required: true, min: 1, max: 10 },
    status_history: [statusHistorySchema],
    personal_info: personalInfoSchema, // Thêm trường thông tin cá nhân
    price: { type: Number, required: true }, // Giá tiền của đặt phòng
    currency: { type: String, default: 'VND' }, // Thêm trường đơn vị tiền tệ
    payment_status: { type: String, enum: ['unpaid', 'paid', 'pay_at_hotel'], default: 'unpaid' }, // Thêm trạng thái thanh toán
  },
  { timestamps: true } // Bật timestamps để theo dõi createdAt và updatedAt
);

module.exports = mongoose.model('Booking', bookingSchema);
