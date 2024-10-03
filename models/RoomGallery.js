const mongoose = require('mongoose');

const roomGallerySchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    image_url: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('RoomGallery', roomGallerySchema);
