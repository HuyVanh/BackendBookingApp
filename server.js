const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');
const connectDB = require('./config/db');
const routes = require('./routes');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const PaymentMethod = require('./models/PaymentMethod');
const SocketService = require('./servicesSocket/socketService'); 

dotenv.config();

// Setup Socket.IO với CORS
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
});
const socketService = new SocketService(io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }  // Thêm dòng này
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

const fs = require('fs');
const uploadDir = path.join(__dirname, 'public/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/api/uploads', express.static(path.join(__dirname, 'public/uploads')));
// Routes
app.use('/api', routes);

// Xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

const createDefaultPaymentMethods = async () => {
  // ... giữ nguyên phần này
};

// Sửa lại phần khởi động server
const startServer = async () => {
  try {
    // Kết nối MongoDB
    await connectDB();
    console.log('Connected to MongoDB successfully');

    // Tạo payment methods sau khi kết nối DB thành công
    await createDefaultPaymentMethods();

    // Khởi động server với socket.io
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server đang chạy trên cổng ${PORT}`);
      console.log('Socket.IO đã được khởi tạo và sẵn sàng nhận kết nối');
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};


// Thêm hàm xử lý khi server shutdown
const gracefulShutdown = () => {
  console.log('Nhận tín hiệu tắt server...');
  server.close(() => {
    console.log('Server đã đóng các kết nối.');
    process.exit(0);
  });
};

// Xử lý các tín hiệu tắt server
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

// Export để sử dụng ở nơi khác
module.exports = { app, io };