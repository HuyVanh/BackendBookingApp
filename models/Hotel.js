// models/Hotel.js
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Các trường khác như địa chỉ, mô tả, trạng thái hoạt động, v.v.
});

module.exports = mongoose.model('Hotel', hotelSchema);
