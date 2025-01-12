// controllers/statisticsController.js
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
/**
 * Hàm lấy thống kê tổng quan cho trang thống kê
 * Bao gồm: tổng số phòng, tổng số đặt phòng, tổng số người dùng, tổng doanh thu
 */
exports.getStatistics = async (req, res) => {
  try {
    const { branchId, startDate, endDate } = req.query;
    let query = {};

    // Add date range filter if provided
    if (startDate && endDate) {
      query.booking_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Add branch filter if provided
    if (branchId && branchId !== 'undefined' && branchId !== '[object Object]') {
      // Kiểm tra nếu branchId là một ObjectId hợp lệ
      if (mongoose.isValidObjectId(branchId)) {
        query['room.hotel'] = new mongoose.Types.ObjectId(branchId);
      }
    }

    // Tổng số phòng (có thể filter theo branch)
    const roomQuery = branchId && branchId !== 'undefined' && branchId !== '[object Object]'
      ? { hotel: new mongoose.Types.ObjectId(branchId) }
      : {};
    const totalRooms = await Room.countDocuments(roomQuery);

    // Tổng số đặt phòng
    const bookingMatchStage = { ...query };
    if (query['room.hotel']) {
      delete bookingMatchStage['room.hotel'];
      bookingMatchStage['$expr'] = {
        $eq: ['$room.hotel', query['room.hotel']]
      };
    }
    const totalBookings = await Booking.countDocuments(bookingMatchStage);

    // Tổng số người dùng
    const totalUsers = await User.countDocuments();

    // Tổng doanh thu từ các đặt phòng đã được xác nhận
    const totalRevenueData = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          ...bookingMatchStage
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'room'
        }
      },
      {
        $unwind: '$room'
      },
      ...(branchId && branchId !== 'undefined' && branchId !== '[object Object]' ? [
        {
          $match: {
            'room.hotel': new mongoose.Types.ObjectId(branchId)
          }
        }
      ] : []),
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    // Doanh thu theo chi nhánh
    const branchRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          ...bookingMatchStage
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'room'
        }
      },
      {
        $unwind: '$room'
      },
      {
        $lookup: {
          from: 'hotels',
          localField: 'room.hotel',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      {
        $unwind: '$hotel'
      },
      {
        $group: {
          _id: '$hotel._id',
          name: { $first: '$hotel.name' },
          revenue: { $sum: '$price' }
        }
      }
    ]);

    res.status(200).json({
      totalRooms,
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenueData[0]?.totalRevenue || 0,
      branchRevenue: branchRevenue.reduce((acc, curr) => {
        acc[curr._id] = curr.revenue;
        return acc;
      }, {})
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
    const { branchId, startDate, endDate } = req.query;
    let matchStage = { status: 'confirmed' };

    if (startDate && endDate) {
      matchStage.booking_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 7 days if no date range provided
      const past7Days = new Date();
      past7Days.setDate(past7Days.getDate() - 6);
      matchStage.booking_date = { $gte: past7Days };
    }

    const revenuePerDay = await Booking.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'room'
        }
      },
      {
        $unwind: '$room'
      },
      ...(branchId && branchId !== 'undefined' && branchId !== '[object Object]' ? [
        {
          $match: {
            'room.hotel': new mongoose.Types.ObjectId(branchId)
          }
        }
      ] : []),
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$booking_date' }
          },
          totalRevenue: { $sum: '$price' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json(revenuePerDay);
  } catch (error) {
    console.error('Lỗi khi lấy thống kê doanh thu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};

// Thêm endpoint mới để lấy doanh thu theo chi nhánh
exports.getBranchRevenue = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;
    let matchStage = { status: 'confirmed' };

    // Thêm điều kiện lọc theo branchId
    if (branchId) {
      matchStage['room.hotel'] = new mongoose.Types.ObjectId(branchId);
    }

    if (startDate && endDate) {
      matchStage.booking_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const branchRevenue = await Booking.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'room'
        }
      },
      {
        $unwind: '$room'
      },
      {
        $lookup: {
          from: 'hotels',
          localField: 'room.hotel',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      {
        $unwind: '$hotel'
      },
      // Đặt $match sau các $lookup để có thể lọc theo hotel._id
      {
        $match: {
          ...matchStage,
          ...(branchId ? { 'hotel._id': new mongoose.Types.ObjectId(branchId) } : {})
        }
      },
      {
        $group: {
          _id: '$hotel._id',
          name: { $first: '$hotel.name' },
          revenue: { $sum: '$price' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    // Nếu không có dữ liệu và có branchId, trả về mảng có chi nhánh với doanh thu 0
    if (branchRevenue.length === 0 && branchId) {
      // Lấy thông tin chi nhánh từ DB
      const hotel = await Hotel.findById(branchId);
      if (hotel) {
        return res.status(200).json([{
          _id: hotel._id,
          name: hotel.name,
          revenue: 0
        }]);
      }
    }

    res.status(200).json(branchRevenue);
  } catch (error) {
    console.error('Lỗi khi lấy doanh thu theo chi nhánh:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};
exports.getRoomRevenue = async (req, res) => {
  try {
    const { startDate, endDate, branchId } = req.query;
    let matchStage = { status: 'confirmed' };

    if (startDate && endDate) {
      matchStage.booking_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const roomRevenue = await Booking.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomInfo'
        }
      },
      {
        $unwind: '$roomInfo'
      },
      {
        $lookup: {
          from: 'hotels',
          localField: 'roomInfo.hotel',
          foreignField: '_id',
          as: 'hotelInfo'
        }
      },
      {
        $unwind: '$hotelInfo'
      },
      ...(branchId ? [
        {
          $match: {
            'hotelInfo._id': new mongoose.Types.ObjectId(branchId)
          }
        }
      ] : []),
      {
        $group: {
          _id: '$roomInfo._id',
          roomName: { $first: '$roomInfo.room_name' }, // Thay đổi từ name thành room_name
          roomType: { $first: '$roomInfo.details.room_type' }, // Lấy thêm loại phòng
          hotelName: { $first: '$hotelInfo.name' },
          ticketCount: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    res.status(200).json(roomRevenue);
  } catch (error) {
    console.error('Lỗi khi lấy doanh thu theo phòng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
};