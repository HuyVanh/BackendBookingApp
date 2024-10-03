const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method_type: { type: String, enum: ['Paypal', 'VNPAY', 'ZaloPay', 'Thẻ tín dụng'], required: true },
    card_number: { type: String },
    expiration_date: { type: Date },
    security_code: { type: String },
  },
  { timestamps: false }
);

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
