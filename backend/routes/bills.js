const express = require('express');
const router = express.Router();
const { 
  createBill, 
  getBills, 
  getBillById, 
  updateBill, 
  deleteBill, 
  getUserBills,
  updateBillStatus,
  generateBillsForAllUsers
} = require('../controllers/bills');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes only
router.route('/generate-all')
  .post(protect, admin, generateBillsForAllUsers);

router.route('/user/:id')
  .get(protect, admin, getUserBills);

// Main routes
router.route('/')
  .post(protect, admin, createBill)
  .get(protect, admin, getBills);

router.route('/:id/status')
  .put(protect, admin, updateBillStatus);

router.route('/:id')
  .get(protect, admin, getBillById)
  .put(protect, admin, updateBill)
  .delete(protect, admin, deleteBill);

module.exports = router; 