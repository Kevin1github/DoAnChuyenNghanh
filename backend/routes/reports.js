const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const reportsController = require('../controllers/reports');

// Get all report data - requires admin auth
router.get('/dashboard', protect, admin, reportsController.getDashboardData);

// Get monthly revenue data
router.get('/revenue', protect, admin, reportsController.getRevenueData);

// Get recent payments
router.get('/recent-payments', protect, admin, reportsController.getRecentPayments);

// Export analytics in various formats
router.get('/export/:format', protect, admin, reportsController.exportReports);

module.exports = router; 