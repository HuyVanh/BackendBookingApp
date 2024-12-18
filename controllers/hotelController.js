const Hotel = require('../models/Hotel');

// Tạo mới hotel
exports.createHotel = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên khách sạn.' });
    }

    const hotel = new Hotel({ name });
    await hotel.save();

    res.status(201).json(hotel);
  } catch (error) {
    console.error('Lỗi khi tạo khách sạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Lấy danh sách tất cả hotel
exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách sạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Lấy thông tin chi tiết 1 hotel theo ID
exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn.' });
    }
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin khách sạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Cập nhật thông tin hotel
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn.' });
    }

    if (name) hotel.name = name;
    hotel.updated_at = Date.now();

    await hotel.save();
    res.status(200).json(hotel);
  } catch (error) {
    console.error('Lỗi khi cập nhật khách sạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Xóa hotel
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn.' });
    }

    await hotel.remove();
    res.status(200).json({ message: 'Xóa khách sạn thành công.' });
  } catch (error) {
    console.error('Lỗi khi xóa khách sạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Bật/tắt trạng thái khách sạn
exports.toggleHotelStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm khách sạn theo ID
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn.' });
    }

    // Đảo ngược trạng thái hiện tại
    hotel.isActive = !hotel.isActive;
    hotel.updated_at = Date.now();

    await hotel.save();

    res.status(200).json({
      message: `Khách sạn đã được ${hotel.isActive ? 'kích hoạt' : 'vô hiệu hóa'}.`,
      isActive: hotel.isActive
    });
  } catch (error) {
    console.error('Lỗi khi bật/tắt trạng thái khách sạn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
