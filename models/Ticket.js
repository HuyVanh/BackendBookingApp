// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  qr_code: { type: String, required: true }, // Lưu mã QR dưới dạng base64 hoặc đường dẫn tới file hình ảnh
  created_at: { type: Date, default: Date.now },
  // Bạn có thể thêm các trường khác nếu cần, ví dụ:
  is_used: { type: Boolean, default: false }, // Đánh dấu vé đã được sử dụng hay chưa
});

module.exports = mongoose.model('Ticket', ticketSchema);
