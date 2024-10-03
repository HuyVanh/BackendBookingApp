const Room = require('../models/Room');
const RoomGallery = require('../models/RoomGallery');
const RoomMap = require('../models/RoomMap');

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('roomGallery')
      .populate('roomMap');
    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('roomGallery')
      .populate('roomMap');
    if (!room) return res.status(404).json({ message: 'Room not found.' });
    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { room_name, address, room_image, rating, price } = req.body;
    const room = new Room({
      room_name,
      address,
      room_image,
      rating,
      price,
    });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { room_name, address, room_image, rating, price } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    room.room_name = room_name || room.room_name;
    room.address = address || room.address;
    room.room_image = room_image || room.room_image;
    room.rating = rating || room.rating;
    room.price = price || room.price;
    room.updated_at = Date.now();

    await room.save();
    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    await room.remove();
    res.status(200).json({ message: 'Room deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};
