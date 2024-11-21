// controllers/serviceController.js
const Service = require('../models/Service');
const Room = require('../models/Room'); // Đảm bảo bạn đã import Room nếu sử dụng trong deleteService

/**
 * Tạo dịch vụ mới
 */
exports.createService = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên dịch vụ.' });
    }

    const service = new Service({ name, image });
    await service.save();

    res.status(201).json(service);
  } catch (error) {
    console.error('Lỗi khi tạo dịch vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Cập nhật dịch vụ
 */
exports.updateService = async (req, res) => {
  try {
    const { name, image } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ.' });
    }

    service.name = name || service.name;
    service.image = image || service.image;

    await service.save();

    res.status(200).json(service);
  } catch (error) {
    console.error('Lỗi khi cập nhật dịch vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Lấy danh sách tất cả các dịch vụ
 */
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Xóa dịch vụ
 */
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ.' });
    }

    // Kiểm tra xem dịch vụ có đang được sử dụng trong phòng nào không
    const roomsUsingService = await Room.find({ services: service._id });

    if (roomsUsingService.length > 0) {
      return res.status(400).json({
        message: 'Không thể xóa dịch vụ đang được sử dụng trong phòng.',
      });
    }

    await service.remove();

    res.status(200).json({ message: 'Xóa dịch vụ thành công.' });
  } catch (error) {
    console.error('Lỗi khi xóa dịch vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
