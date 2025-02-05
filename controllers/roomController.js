// controllers/roomController.js
const Room = require("../models/Room");
const User = require("../models/User");
const Hotel = require('../models/Hotel');
const mongoose = require("mongoose");



exports.getAllRooms = async (req, res) => {
  try {
    const filter = {};

    // Kiểm tra trạng thái phòng
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }

    if (req.query.room_type) {
      filter['details.room_type'] = req.query.room_type;
    }

    // Lấy phòng từ các chi nhánh đang hoạt động
    const rooms = await Room.find(filter)
      .populate({
        path: "hotel",
        match: { isActive: true }, // Chỉ lấy chi nhánh đang hoạt động
        select: "name address isActive" // Chỉ lấy các trường cần thiết
      });

    // Lọc bỏ các phòng không có thông tin khách sạn (do khách sạn không active)
    const filteredRooms = rooms.filter(room => room.hotel != null);

    res.status(200).json(filteredRooms);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// controllers/roomController.js

exports.getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;

    // Kiểm tra ID
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "ID phòng không hợp lệ." });
    }

    // Thêm populate('hotel') để lấy thông tin chi tiết khách sạn
    let room = await Room.findById(roomId)
      .populate("hotel") // Populate hotel
      .populate("services"); // Nếu muốn, có thể populate services

    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy phòng." });
    }

    // Cập nhật views và last_viewed_at trực tiếp trên document
    room.views += 1;
    room.last_viewed_at = new Date();
    await room.save();

    res.status(200).json(room);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phòng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * Hàm tạo một phòng mới
 */
exports.createRoom = async (req, res) => {
  try {
    const {
      hotel,
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
    if (
      !hotel ||
      !room_name ||
      !address ||
      !price ||
      !latitude ||
      !longitude ||
      !details
    ) {
      return res
        .status(400)
        .json({
          message: "Vui lòng cung cấp đầy đủ thông tin phòng (bao gồm hotel).",
        });
    }

    // Tạo đối tượng phòng mới
    const room = new Room({
      hotel,
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
    console.error("Lỗi khi tạo phòng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
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
      return res.status(404).json({ message: "Không tìm thấy phòng." });
    }

    // Cập nhật thông tin phòng
    if (room_name !== undefined) room.room_name = room_name;
    if (address !== undefined) room.address = address;
    if (room_images !== undefined) room.room_images = room_images;
    if (details !== undefined) room.details = details;
    if (price !== undefined) room.price = price;
    if (description !== undefined) room.description = description;
    if (services !== undefined) room.services = services;
    if (rating !== undefined) room.rating = rating;
    if (latitude !== undefined) room.latitude = latitude;
    if (longitude !== undefined) room.longitude = longitude;
    if (isActive !== undefined) room.isActive = isActive;
    if (isRented !== undefined) room.isRented = isRented;

    room.updated_at = Date.now();

    // Lưu thay đổi vào cơ sở dữ liệu
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
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
      return res.status(404).json({ message: "Không tìm thấy phòng." });
    }

    // Xóa phòng khỏi cơ sở dữ liệu
    await room.remove();
    res.status(200).json({ message: "Xóa phòng thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa phòng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * Hàm lấy danh sách phòng phổ biến
 */
exports.getPopularRooms = async (req, res) => {
  try {
    console.log("Auth header:", req.headers.authorization);
    console.log("User:", req.user);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const rooms = await Room.find({
      updated_at: { $gte: thirtyDaysAgo },
    })
      .sort({
        bookings_count: -1,
        average_rating: -1,
        views: -1,
      })
      .limit(10);

    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ." });
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
    console.error("Lỗi khi lấy danh sách phòng xu hướng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * Hàm lấy danh sách phòng gợi ý cho người dùng
 */
exports.getSuggestedRooms = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const user = await User.findById(userId);
    const rooms = await Room.find({ isActive: true }).select("-__v").limit(10);
    res.json(rooms);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({ message: error.message });
  }
};
