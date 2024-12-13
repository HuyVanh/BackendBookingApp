// models/Room.js
const mongoose = require('mongoose');

/**
 * Mô hình phòng
 */
const roomSchema = new mongoose.Schema(
  {
    hotel: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Hotel', 
      required: true 
    },
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
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    rating: { type: Number, default: 0 }, // Đánh giá
    isActive: { type: Boolean, default: true }, // Phòng đang hoạt động hay không
    isRented: { type: Boolean, default: false }, // Phòng đã được thuê hay chưa
    latitude: { type: Number, required: true }, // Vĩ độ
    longitude: { type: Number, required: true }, // Kinh độ
    created_at: { type: Date, default: Date.now }, // Ngày tạo
    updated_at: { type: Date, default: Date.now }, // Ngày cập nhật

    // Thêm các trường mới cho chức năng
    bookings_count: { type: Number, default: 0 }, // Số lượng đặt phòng
    views: { type: Number, default: 0 }, // Số lượt xem
    last_viewed_at: { type: Date }, // Thời gian xem cuối
    recent_bookings: { type: Number, default: 0 }, // Đặt phòng gần đây
  },
  { timestamps: false }
);

module.exports = mongoose.model('Room', roomSchema);
