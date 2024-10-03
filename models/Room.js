const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    room_name: { type: String, required: true },
    address: { type: String, required: true },
    room_image: { type: String },
    rating: { type: Number, min: 0.0, max: 5.0 },
    price: { type: mongoose.Types.Decimal128, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Room', roomSchema);
