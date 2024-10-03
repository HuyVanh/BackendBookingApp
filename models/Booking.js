const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    booking_date: { type: Date, default: Date.now },
    check_in: { type: Date, required: true },
    check_out: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'canceled'], default: 'pending' },
    guests_count: { type: Number, required: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Booking', bookingSchema);
