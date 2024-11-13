// models/Room.js
const mongoose = require('mongoose');

/**
 * Mô hình phòng
 */
const roomSchema = new mongoose.Schema(
  {
    room_name: { type: String, required: true }, // Tên phòng
    address: { type: String, required: true }, // Địa chỉ
    room_images: [{ type: String }], // Danh sách hình ảnh phòng
    details: {
      room_type: { type: String, required: true }, // Loại phòng
      bed: { type: String, required: true }, // Loại giường
      size: { type: String, required: true }, // Kích thước phòng
      guests: { type: Number, required: true }, // Số lượng khách
    },
    price: { type: Number, required: true }, // Giá phòng
    description: { type: String }, // Mô tả phòng
    services: [{ type: String }], // Dịch vụ kèm theo
    rating: { type: Number, default: 0 }, // Đánh giá
    latitude: { type: Number, required: true }, // Vĩ độ
    longitude: { type: Number, required: true }, // Kinh độ
    created_at: { type: Date, default: Date.now }, // Ngày tạo
    updated_at: { type: Date, default: Date.now }, // Ngày cập nhật
  },
  { timestamps: false }
);

module.exports = mongoose.model('Room', roomSchema);
