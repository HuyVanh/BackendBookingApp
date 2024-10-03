const mongoose = require('mongoose');

const roomReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    rating: { type: Number, min: 0.0, max: 5.0 },
    comment: { type: String },
    review_date: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('RoomReview', roomReviewSchema);
