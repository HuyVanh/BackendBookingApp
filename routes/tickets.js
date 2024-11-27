// routes/tickets.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizeRole');

// Tạo vé cho đặt phòng (sau khi thanh toán)
router.post('/:booking_id', authenticateJWT, ticketController.createTicket);

// Lấy thông tin vé
router.get('/:booking_id', authenticateJWT, ticketController.getTicket);

// Kiểm tra vé đã được sử dụng hay chưa
router.get('/:booking_id/check', authenticateJWT, ticketController.checkTicketUsage);

// Đánh dấu vé là đã sử dụng
router.post('/:booking_id/use', authenticateJWT, ticketController.markTicketAsUsed);

// Nhân viên quét vé bằng mã QR
router.post('/check-qr', authenticateJWT, authorizeRole(['admin', 'staff']), ticketController.checkTicketByQRCode);


module.exports = router;
