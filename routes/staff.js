const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');
const { verifyTicket, getScanHistory } = require('../controllers/staffController');

router.post('/verify-ticket', authenticateJWT, authorizeRole('staff'), verifyTicket);
router.get('/scan-history', authenticateJWT, authorizeRole('staff'), getScanHistory);

module.exports = router;