// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  qr_code: { type: String, required: true },
  qr_data: { type: Object}, 
  created_at: { type: Date, default: Date.now },
  is_used: { type: Boolean, default: false },
  // Thêm trường scan_history để lưu lịch sử quét vé
  scan_history: [
    {
      scanned_at: { type: Date, default: Date.now },
      scanned_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    },
  ],
});

module.exports = mongoose.model('Ticket', ticketSchema);
