const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    payment_method: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    payment_date: {
      type: Date,
    },
    // Thêm các fields cho Stripe
    stripe_payment_intent_id: String,
    stripe_client_secret: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('Payment', paymentSchema);