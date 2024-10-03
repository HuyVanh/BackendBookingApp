const RoomReview = require('../models/RoomReview');
const Room = require('../models/Room');

exports.createReview = async (req, res) => {
  try {
    const { room_id, rating, comment } = req.body;

    // Kiểm tra phòng tồn tại
    const room = await Room.findById(room_id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    // Tạo đánh giá mới
    const review = new RoomReview({
      user: req.user.user_id,
      room: room_id,
      rating,
      comment,
    });
    await review.save();

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getReviewsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const reviews = await RoomReview.find({ room: roomId })
      .populate('user', 'username email');
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await RoomReview.find({ user: req.user.user_id })
      .populate('room', 'room_name address');
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
