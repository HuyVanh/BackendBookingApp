const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['success', 'error', 'info'], required: true },
    created_at: { type: Date, default: Date.now },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Notification', notificationSchema);
