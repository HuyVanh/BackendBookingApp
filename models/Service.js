const mongoose = require('mongoose');

/**
 * Mô hình dịch vụ phòng
 */
const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên dịch vụ
    icon: { type: String }, // Icon (có thể là URL hoặc tên file)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
