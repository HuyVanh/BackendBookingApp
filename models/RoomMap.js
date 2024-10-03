const mongoose = require('mongoose');

const roomMapSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', unique: true, required: true },
    map_coordinates: { type: String },
    address: { type: String },
  },
  { timestamps: false }
);

module.exports = mongoose.model('RoomMap', roomMapSchema);
