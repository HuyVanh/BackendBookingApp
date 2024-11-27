// controllers/statisticsController.js

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

/**
 * Hàm lấy thống kê tổng quan cho trang thống kê
 * Bao gồm: tổng số phòng, tổng số đặt phòng, tổng số người dùng, tổng doanh thu
 */
exports.getStatistics = async (req, res) => {
    try {
      // Bỏ phần tính tổng số khách sạn
      // const totalHotels = await Hotel.countDocuments();
  
      // Tổng số phòng
      const totalRooms = await Room.countDocuments();
  
      // Tổng số đặt phòng
      const totalBookings = await Booking.countDocuments();
  
      // Tổng số người dùng
      const totalUsers = await User.countDocuments();
  
      // Tổng doanh thu từ các đặt phòng đã được xác nhận
      const totalRevenueData = await Booking.aggregate([
        { $match: { status: 'confirmed' } }, // Chỉ tính doanh thu từ các đặt phòng đã xác nhận
        { $group: { _id: null, totalRevenue: { $sum: '$price' } } },
      ]);
      const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;
  
      // Trả về dữ liệu thống kê (loại bỏ totalHotels)
      res.status(200).json({
        // totalHotels, // Loại bỏ dòng này
        totalRooms,
        totalBookings,
        totalUsers,
        totalRevenue,
      });
    } catch (error) {
      console.error('Lỗi khi lấy thống kê:', error);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  };

/**
 * Hàm thống kê số lượng đặt phòng theo ngày trong 7 ngày qua
 * Trả về số lượt đặt phòng mỗi ngày, bất kể trạng thái
 */
exports.getBookingStats = async (req, res) => {
  try {
    // Lấy ngày hiện tại và lùi lại 6 ngày để có tổng cộng 7 ngày
    const past7Days = new Date();
    past7Days.setDate(past7Days.getDate() - 6);

    const bookingsPerDay = await Booking.aggregate([
      { $match: { booking_date: { $gte: past7Days } } }, // Chỉ lấy các đặt phòng trong 7 ngày qua
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$booking_date' },
          }, // Nhóm theo ngày đặt phòng
          count: { $sum: 1 }, // Đếm số lượng đặt phòng mỗi ngày
        },
      },
      { $sort: { _id: 1 } }, // Sắp xếp theo ngày tăng dần
    ]);

    res.status(200).json(bookingsPerDay);
  } catch (error) {
    console.error('Lỗi khi lấy thống kê đặt phòng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

/**
 * Hàm thống kê doanh thu theo ngày trong 7 ngày qua
 * Chỉ tính doanh thu từ các đặt phòng có trạng thái 'confirmed'
 */
exports.getRevenueStats = async (req, res) => {
  try {
    // Lấy ngày hiện tại và lùi lại 6 ngày để có tổng cộng 7 ngày
    const past7Days = new Date();
    past7Days.setDate(past7Days.getDate() - 6);

    const revenuePerDay = await Booking.aggregate([
      {
        $match: {
          booking_date: { $gte: past7Days }, // Chỉ lấy các đặt phòng trong 7 ngày qua
          status: 'confirmed', // Chỉ tính các đặt phòng đã xác nhận
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$booking_date' },
          }, // Nhóm theo ngày đặt phòng
          totalRevenue: { $sum: '$price' }, // Tính tổng doanh thu mỗi ngày
        },
      },
      { $sort: { _id: 1 } }, // Sắp xếp theo ngày tăng dần
    ]);

    res.status(200).json(revenuePerDay);
  } catch (error) {
    console.error('Lỗi khi lấy thống kê doanh thu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
