const mongoose = require('mongoose');

const cancelBookingSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    reason: { type: String },
    refund_amount: { type: mongoose.Types.Decimal128 },
    canceled_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('CancelBooking', cancelBookingSchema);
