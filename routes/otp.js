// routes/otp.js
const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// Route gửi OTP
router.post('/send', otpController.sendOTP);

// Route xác thực OTP
router.post('/verify', otpController.verifyOTP);

module.exports = router;
