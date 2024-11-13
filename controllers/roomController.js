const Room = require('../models/Room');
const RoomGallery = require('../models/RoomGallery');
const RoomMap = require('../models/RoomMap');


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
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng.' });
    }
    res.status(200).json(room);
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
    room.price = price || room.price;
    room.description = description || room.description;
    room.services = services || room.services;
    room.rating = rating !== undefined ? rating : room.rating;
    room.latitude = latitude !== undefined ? latitude : room.latitude;
    room.longitude = longitude !== undefined ? longitude : room.longitude;
    room.updated_at = Date.now();

    // Lưu thay đổi vào cơ sở dữ liệu
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    console.error('Lỗi khi cập nhật phòng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};


// Hàm xóa phòng
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
