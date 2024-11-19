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
    booking_date: { type: Date, default: Date.now },
    check_in: { type: Date, required: true },
    check_out: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
    guests_count: { type: Number, required: true },
    status_history: [statusHistorySchema],
    personal_info: personalInfoSchema, // Thêm trường thông tin cá nhân
    price: { type: Number, required: true }, // Giá tiền của đặt phòng
  },
  { timestamps: false }
);

module.exports = mongoose.model('Booking', bookingSchema);
