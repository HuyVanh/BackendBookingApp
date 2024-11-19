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
const otpRoutes = require('./otp');
const userRoutes = require('./user');
const adminRoutes = require('./admin');
const ticketRoutes = require('./tickets');

router.use('/auth', authRoutes);
router.use('/rooms', roomsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/room-reviews', roomReviewsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/search-history', searchHistoryRoutes);
router.use('/room-filters', roomFiltersRoutes);
router.use('/payment-methods', paymentMethodsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/otp', otpRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/tickets', ticketRoutes);

module.exports = router;
