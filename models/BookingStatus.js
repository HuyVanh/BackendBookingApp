const mongoose = require('mongoose');

const bookingStatusSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    status: { type: String, enum: ['confirmed', 'canceled', 'pending'], required: true },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('BookingStatus', bookingStatusSchema);
