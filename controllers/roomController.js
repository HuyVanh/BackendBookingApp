// controllers/roomController.js
const Room = require('../models/Room');
const User = require('../models/User'); // Import mô hình User để sử dụng trong getSuggestedRooms
const mongoose = require('mongoose');

/**
 * Hàm lấy danh sách tất cả các phòng
 */
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm lấy thông tin chi tiết của một phòng theo ID
 */


exports.getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    console.log('Received request to get room with ID:', roomId);

    // Kiểm tra định dạng ID
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      console.log('Invalid room ID format:', roomId);
      return res.status(400).json({ message: 'ID phòng không hợp lệ.' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      console.log('Room not found with ID:', roomId);
      return res.status(404).json({ message: 'Không tìm thấy phòng.' });
    }

    // Cập nhật views và last_viewed_at bằng updateOne
    const updateResult = await Room.updateOne(
      { _id: roomId },
      { $inc: { views: 1 }, $set: { last_viewed_at: new Date() } }
    );

    if (updateResult.nModified === 0) {
      console.log('Failed to update room views and last_viewed_at for ID:', roomId);
      return res.status(500).json({ message: 'Cập nhật phòng không thành công.' });
    }

    const updatedRoom = await Room.findById(roomId);
    console.log('Room updated successfully:', updatedRoom);

    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phòng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};


/**
 * Hàm tạo một phòng mới
 */
exports.createRoom = async (req, res) => {
  try {
    const {
      room_name,
      address,
      room_images,
      details,
      price,
      description,
      services,
      rating,
      latitude,
      longitude,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!room_name || !address || !price || !latitude || !longitude || !details) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin phòng.' });
    }

    // Tạo đối tượng phòng mới
    const room = new Room({
      room_name,
      address,
      room_images,
      details,
      price,
      description,
      services,
      rating,
      latitude,
      longitude,
    });

    // Lưu phòng vào cơ sở dữ liệu
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error('Lỗi khi tạo phòng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm cập nhật thông tin phòng
 */
exports.updateRoom = async (req, res) => {
  try {
    const {
      room_name,
      address,
      room_images,
      details,
      price,
      description,
      services,
      rating,
      latitude,
      longitude,
      isActive,
      isRented,
    } = req.body;

    // Tìm phòng theo ID
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng.' });
    }

    // Cập nhật thông tin phòng
    room.room_name = room_name || room.room_name;
    room.address = address || room.address;
    room.room_images = room_images || room.room_images;
    room.details = details || room.details;
    room.price = price !== undefined ? price : room.price;
    room.description = description || room.description;
    room.services = services || room.services;
    room.rating = rating !== undefined ? rating : room.rating;
    room.latitude = latitude !== undefined ? latitude : room.latitude;
    room.longitude = longitude !== undefined ? longitude : room.longitude;
    room.isActive = isActive !== undefined ? isActive : room.isActive;
    room.isRented = isRented !== undefined ? isRented : room.isRented;
    room.updated_at = Date.now();

    // Lưu thay đổi vào cơ sở dữ liệu
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    console.error('Lỗi khi cập nhật phòng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm xóa phòng
 */
exports.deleteRoom = async (req, res) => {
  try {
    // Tìm phòng theo ID
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng.' });
    }

    // Xóa phòng khỏi cơ sở dữ liệu
    await room.remove();
    res.status(200).json({ message: 'Xóa phòng thành công.' });
  } catch (error) {
    console.error('Lỗi khi xóa phòng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm lấy danh sách phòng phổ biến
 */
exports.getPopularRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ bookings_count: -1, rating: -1 }).limit(10);
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng phổ biến:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm lấy danh sách phòng xu hướng
 */
exports.getTrendingRooms = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const rooms = await Room.find({
      last_viewed_at: { $gte: oneWeekAgo },
    })
      .sort({ views: -1 })
      .limit(10);

    res.status(200).json(rooms);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng xu hướng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm lấy danh sách phòng gợi ý cho người dùng
 */
exports.getSuggestedRooms = async (req, res) => {
  try {
    const userId = req.user.user_id;
    // Lấy danh sách phòng yêu thích của người dùng
    const user = await User.findById(userId).populate('favorites');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

    const favoriteRoomTypes = user.favorites.map(room => room.details.room_type);

    // Tìm các phòng có cùng loại nhưng chưa được yêu thích
    const suggestedRooms = await Room.find({
      'details.room_type': { $in: favoriteRoomTypes },
      _id: { $nin: user.favorites.map(room => room._id) },
    }).limit(10);

    res.status(200).json(suggestedRooms);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng gợi ý:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
