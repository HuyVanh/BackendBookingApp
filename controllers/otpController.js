// controllers/otpController.js
const crypto = require('crypto');
const OTP = require('../models/OTP');
const User = require('../models/User');
const transporter = require('../config/email');

// Hàm gửi OTP qua email
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email không tồn tại.' });
    }

    // Tạo mã OTP ngẫu nhiên (6 chữ số)
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Xóa bất kỳ OTP cũ nào chưa hết hạn
    await OTP.deleteMany({ userId: user._id });

    // Tạo và lưu OTP mới
    const otp = new OTP({
      userId: user._id,
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // OTP có hiệu lực trong 10 phút
    });
    await otp.save();

    // Cấu hình email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã OTP của bạn',
      text: `Mã OTP của bạn là: ${otpCode}. Mã có hiệu lực trong 10 phút.`,
    };

    // Gửi email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Gửi OTP thất bại.' });
      } else {
        console.log('OTP sent:', info.response);
        return res.status(200).json({ message: 'OTP đã được gửi về email của bạn.' });
      }
    });
  } catch (error) {
    console.error('Error in sendOTP:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra.' });
  }
};

// Hàm xác thực OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email không tồn tại.' });
    }

    // Tìm OTP tương ứng
    const existingOTP = await OTP.findOne({
      userId: user._id,
      code: otp,
      expiresAt: { $gt: Date.now() }, // Chỉ lấy OTP chưa hết hạn
    });

    if (!existingOTP) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }

    // Xác thực thành công, xóa OTP
    await OTP.deleteOne({ _id: existingOTP._id });

    // Tạo JWT hoặc thực hiện các hành động tiếp theo (ví dụ: đăng nhập người dùng)
    // Ví dụ: tạo token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ message: 'Xác thực OTP thành công.', token });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra.' });
  }
};
