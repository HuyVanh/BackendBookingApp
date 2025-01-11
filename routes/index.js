// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const roomsRoutes = require('./rooms');
const bookingsRoutes = require('./bookings');
const roomReviewsRoutes = require('./roomReviews');
const notificationsRoutes = require('./notifications');
const paymentMethodsRoutes = require('./paymentMethods');
const paymentsRoutes = require('./payments');
const otpRoutes = require('./otp');
const userRoutes = require('./user');
const adminRoutes = require('./admin');
const ticketRoutes = require('./tickets');
const servicesRoutes = require('./services');
const statisticsRoutes = require('./statistics');
const hotelsRoutes = require('./hotels');
const messageRoutes = require('./messageRoutes'); 
const staffRoutes = require('./staff'); 

router.use('/auth', authRoutes);
router.use('/rooms', roomsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/room-reviews', roomReviewsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/payment-methods', paymentMethodsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/otp', otpRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/tickets', ticketRoutes);
router.use('/services', servicesRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/hotels', hotelsRoutes);
router.use('/messages', messageRoutes);
router.use('/staff', staffRoutes); 

module.exports = router;
