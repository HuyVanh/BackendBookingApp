const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    payment_method: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
    total_amount: { type: mongoose.Types.Decimal128, required: true },
    payment_date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Payment', paymentSchema);
