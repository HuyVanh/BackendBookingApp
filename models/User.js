const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


/**
 * Mô hình người dùng
 */
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    fullName: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' }, // Role người dùng
    isActive: { type: Boolean, default: true }, // Thêm trường isActive
    avatar: { type: String },
    isVerified: {
      type: Boolean,
      default: false,
  },
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Phương thức so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
