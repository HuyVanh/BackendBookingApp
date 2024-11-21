const mongoose = require('mongoose');

/**
 * Mô hình dịch vụ phòng
 */
const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên dịch vụ
    image: { type: String },
    // Nếu bạn muốn thêm các thuộc tính khác, bạn có thể thêm ở đây
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
