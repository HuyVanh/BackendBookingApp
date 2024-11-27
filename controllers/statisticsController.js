// controllers/statisticsController.js

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

exports.getStatistics = async (req, res) => {
  try {
    // Tổng số khách sạn
    const totalHotels = await Hotel.countDocuments();

    // Tổng số phòng
    const totalRooms = await Room.countDocuments();

    // Tổng số đặt phòng
    const totalBookings = await Booking.countDocuments();

    // Tổng số người dùng
    const totalUsers = await User.countDocuments();

    // Doanh thu
    const totalRevenueData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } },
    ]);
    const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;

    // Trả về dữ liệu
    res.status(200).json({
      totalHotels,
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

exports.getBookingStats = async (req, res) => {
    try {
      const past7Days = new Date();
      past7Days.setDate(past7Days.getDate() - 6);
  
      const bookingsPerDay = await Booking.aggregate([
        { $match: { booking_date: { $gte: past7Days } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$booking_date' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      res.status(200).json(bookingsPerDay);
    } catch (error) {
      console.error('Lỗi khi lấy thống kê đặt phòng:', error);
      res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
  };
