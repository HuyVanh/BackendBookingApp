const mongoose = require('mongoose');

const roomFilterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    location: { type: String },
    price_range: { type: String }, // Ví dụ: "500-1000"
    rating: { type: Number, min: 0.0, max: 5.0 },
    amenities: { type: [String] }, // Ví dụ: ['wifi', 'bể bơi', 'đỗ xe']
  },
  { timestamps: false }
);

module.exports = mongoose.model('RoomFilter', roomFilterSchema);
