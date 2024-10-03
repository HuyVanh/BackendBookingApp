// config/email.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Tạo transporter sử dụng dịch vụ email của bạn (ví dụ: Gmail)
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Hoặc các dịch vụ khác như 'SendGrid', 'Mailgun', v.v.
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng hoặc mật khẩu email
  },
});

module.exports = transporter;
