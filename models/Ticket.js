// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  qr_code: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  is_used: { type: Boolean, default: false },
  // Thêm trường scan_history để lưu lịch sử quét vé
  scan_history: [
    {
      scanned_at: { type: Date, default: Date.now }, // Thời gian quét
      scanned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Nhân viên quét vé
    },
  ],
});

module.exports = mongoose.model('Ticket', ticketSchema);
