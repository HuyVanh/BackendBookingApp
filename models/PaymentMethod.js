const mongoose = require('mongoose');
const crypto = require('crypto');

const paymentMethodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    method_type: { type: String, enum: ['Paypal', 'VNPAY', 'ZaloPay', 'Thẻ tín dụng'], required: true },
    card_number: { type: String },
    expiration_date: { type: Date },
    security_code: { type: String },
  },
  { timestamps: false }
);

// Mã hóa thông tin thẻ trước khi lưu
paymentMethodSchema.pre('save', function (next) {
  if (this.isModified('card_number') && this.card_number) {
    this.card_number = encrypt(this.card_number);
  }
  if (this.isModified('security_code') && this.security_code) {
    this.security_code = encrypt(this.security_code);
  }
  next();
});

// Hàm mã hóa
function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);

  if (!key) {
    throw new Error('ENCRYPTION_KEY không được xác định.');
  }

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const encryptedData = iv.toString('hex') + ':' + encrypted;
  return encryptedData;
}

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
