// models/PaymentMethod.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentMethodSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  method_type: {
    type: String,
    required: true,
    enum: ['Stripe', 'Thanh toán khi đến nơi']
  },
  description: String,
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
module.exports = PaymentMethod;