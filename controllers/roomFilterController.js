const RoomFilter = require('../models/RoomFilter');

exports.getRoomFilter = async (req, res) => {
  try {
    const filter = await RoomFilter.findOne({ user: req.user.user_id });
    if (!filter) return res.status(404).json({ message: 'Room filter not found.' });
    res.status(200).json(filter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createOrUpdateRoomFilter = async (req, res) => {
  try {
    const { location, price_range, rating, amenities } = req.body;

    let filter = await RoomFilter.findOne({ user: req.user.user_id });
    if (filter) {
      // Cập nhật
      filter.location = location || filter.location;
      filter.price_range = price_range || filter.price_range;
      filter.rating = rating || filter.rating;
      filter.amenities = amenities || filter.amenities;
      await filter.save();
      return res.status(200).json(filter);
    }

    // Tạo mới
    filter = new RoomFilter({
      user: req.user.user_id,
      location,
      price_range,
      rating,
      amenities,
    });
    await filter.save();
    res.status(201).json(filter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteRoomFilter = async (req, res) => {
  try {
    const filter = await RoomFilter.findOneAndDelete({ user: req.user.user_id });
    if (!filter) return res.status(404).json({ message: 'Room filter not found.' });
    res.status(200).json({ message: 'Room filter deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
