// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const roomsRoutes = require('./rooms');
const bookingsRoutes = require('./bookings');
const roomReviewsRoutes = require('./roomReviews');
const notificationsRoutes = require('./notifications');
const searchHistoryRoutes = require('./searchHistory');
const roomFiltersRoutes = require('./roomFilters');
const paymentMethodsRoutes = require('./paymentMethods');
const paymentsRoutes = require('./payments');
const otpRoutes = require('./otp'); // Import OTP routes

router.use('/auth', authRoutes);
router.use('/rooms', roomsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/roomReviews', roomReviewsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/searchHistory', searchHistoryRoutes);
router.use('/roomFilters', roomFiltersRoutes);
router.use('/paymentMethods', paymentMethodsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/otp', otpRoutes); // Sử dụng OTP routes

module.exports = router;
