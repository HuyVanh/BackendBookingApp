// server.js
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const routes = require('./routes');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan'); // Import morgan

dotenv.config();

// Kết nối tới MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sử dụng Morgan để log HTTP requests
app.use(morgan('combined')); // Sử dụng morgan

// Routes
app.use('/api', routes);

// Xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});


// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

module.exports = app; // Export app để sử dụng trong testing (nếu cần)
