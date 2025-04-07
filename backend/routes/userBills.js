const express = require('express');
const router = express.Router();
const { getMyBills, payBill, getMyPaymentHistory } = require('../controllers/bills');
const { protect } = require('../middleware/authMiddleware');

// User-specific bill routes
router.route('/my-bills')
  .get(protect, getMyBills);

router.route('/:id/pay')
  .put(protect, payBill);

// Payment history route
router.route('/payment-history')
  .get(protect, getMyPaymentHistory);

module.exports = router; 