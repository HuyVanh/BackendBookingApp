const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    full_name: { type: String },
    birthday: { type: Date },
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
    phone_number: { type: String },
    profile_picture: { type: String },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Profile', profileSchema);
