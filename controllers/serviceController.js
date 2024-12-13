const Service = require('../models/Service');
const Room = require('../models/Room');

/**
 * Tạo dịch vụ mới
 */
exports.createService = async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên dịch vụ.' });
    }

    const service = new Service({ name, icon });
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
    const { name, icon } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ.' });
    }

    if (name) service.name = name;
    if (icon) service.icon = icon;

    await service.save();

    res.status(200).json(service);
  } catch (error) {
    console.error('Lỗi khi cập nhật dịch vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Lấy danh sách tất cả các dịch vụ đang hoạt động
 */
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.status(200).json(services);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Lấy danh sách tất cả dịch vụ (dành cho admin)
 */
exports.getAllServicesAdmin = async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }

    const services = await Service.find({});
    res.status(200).json(services);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Thay đổi trạng thái hoạt động của dịch vụ
 */
exports.toggleServiceStatus = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Không tìm thấy dịch vụ.' });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({ message: 'Cập nhật trạng thái dịch vụ thành công.', service });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái dịch vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
